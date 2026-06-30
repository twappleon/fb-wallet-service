# FB 体育免转钱包后端服务

Spring Boot + Redis 实现的 FB 体育 single wallet 对接骨架。该服务运行在商户侧，负责接收 FB 体育的 `/fb/callback/*` 请求，并处理余额查询、下注扣款、扣款状态确认、流水同步、订单同步和提前结算同步。

## 核心目标

- 让 FB 体育能够查询商户侧玩家可用余额。
- 在下注扣款场景保证同一 `transactionId` 不重复扣款。
- 在结算、取消、拒单、回滚和提前结算场景保证资金流水幂等。
- 在订单同步场景按 `version` 防止旧订单数据覆盖新数据。
- 预留 FB Data Service 主动拉单入口，方便补单和对账。

## 已实现接口

- `/fb/callback/balance` 余额查询
- `/fb/callback/order_pay` 下注扣款
- `/fb/callback/check_order_pay` 扣款状态补查
- `/fb/callback/sync_transaction` 流水同步
- `/fb/callback/sync_orders` 订单同步，按 `version` 防止旧数据覆盖
- `/fb/callback/sync_cashout` 提前结算同步
- `/fb/callback/health` 健康检查
- `/internal/fb/pull/orders` 内部主动拉单入口

## 目录说明

```text
src/main/java/com/example/fbwallet
├── api          # 请求/响应 DTO
├── client       # FB Data Service 客户端
├── config       # 配置属性和 Bean
├── controller   # HTTP 接口
├── model        # Redis 中保存的领域记录
├── scheduler    # 定时拉单任务
├── security     # callback IP 和签名校验
└── service      # 钱包回调、拉单和 Redis key 逻辑
```

## 启动

```bash
docker compose up -d redis
./mvnw spring-boot:run
```

健康检查：

```bash
curl http://localhost:8080/actuator/health
```

## 构建与测试

```bash
./mvnw test
```

## 关键配置

生产环境至少需要配置：

```bash
export FB_MERCHANT_ID="your-merchant-id"
export FB_CALLBACK_SIGNATURE_ENABLED=true
export FB_CALLBACK_SECRET="fb-callback-secret"
export FB_CALLBACK_ALLOWED_IPS="1.2.3.4,5.6.7.8"
export FB_DATA_SERVICE_BASE_URL="https://fb-data-service-domain"
export FB_DATA_SERVICE_APP_SECRET="fb-data-service-secret"
```

目前签名实现为占位的 `HMAC-SHA256(timestamp + method + path + body)`。拿到 FB 正式签名字段和算法后，只需要调整：

- `security/CallbackSecurityFilter.java`
- `client/FbDataServiceClient.java`

## API 说明

### 健康检查

`POST /fb/callback/health`

用于给 FB 体育检查商户 callback 服务是否可用。

成功响应：

```json
{
  "success": true,
  "message": null,
  "data": null,
  "code": 0
}
```

### 余额查询

`POST /fb/callback/balance`

请求示例：

```json
{
  "merchantUserId": "u1001",
  "merchantId": "m1",
  "currencyId": "CNY"
}
```

响应示例：

```json
{
  "success": true,
  "message": null,
  "data": {
    "balance": 100.00,
    "currencyId": "CNY"
  },
  "code": 0
}
```

### 下注扣款

`POST /fb/callback/order_pay`

同一 `transactionId` 会命中 Redis 幂等记录，重复请求不会再次扣款。

请求示例：

```json
{
  "transactionId": "tx-1",
  "merchantUserId": "u1001",
  "merchantId": "m1",
  "businessId": "order-1",
  "transactionType": "OUT",
  "transferType": "BET",
  "currencyId": "CNY",
  "amount": 10,
  "status": 1
}
```

返回码约定：

- `0`：成功
- `1`：失败
- `6`：处理中或结果不确定
- `9`：余额不足

### 扣款状态补查

`POST /fb/callback/check_order_pay`

用于 FB 在 `order_pay` 超时、网络异常或结果不确定时查询最终扣款结果。服务会按 `transactionId` 读取 Redis 中的已处理记录。

### 交易流水同步

`POST /fb/callback/sync_transaction`

支持单条、数组或 `{ "data": [...] }` 三种 payload 形态。服务逐笔处理并返回失败的 `transactionId` 列表。

### 订单同步

`POST /fb/callback/sync_orders`

订单按 `id` 存入 Redis，并使用 `version` 判断新旧数据。只有传入版本大于或等于本地版本时才更新。

### 提前结算同步

`POST /fb/callback/sync_cashout`

提前结算数据按 `id` 保存原始 payload，供后续查询或补偿使用。

### 内部主动拉单

`POST /internal/fb/pull/orders`

请求示例：

```json
{
  "orderIds": ["order-1", "order-2"]
}
```

该接口会调用 FB Data Service 的订单查询封装，并把返回数据交给订单同步逻辑处理。生产环境必须给 `/internal/**` 增加鉴权或限制内网访问。

## Redis Key 设计

- `fb:wallet:balance:{merchantUserId}:{currencyId}`：用户余额
- `fb:transaction:{transactionId}`：资金流水幂等记录
- `fb:lock:transaction:{transactionId}`：扣款分布式锁
- `fb:order:{orderId}`：订单原始数据和版本
- `fb:cashout:{cashoutId}`：提前结算原始数据
- `fb:pull:cursor:orders`：主动拉单游标

## 资金处理规则

- `transactionType=OUT`：扣款，余额不足返回 `code=9`。
- `transactionType=IN`：入账，增加用户余额。
- `status=0`：认为交易失败，不做资金变更。
- 所有交易按 `transactionId` 记录结果，重复请求直接返回历史结果。
- 扣款处理中使用 `fb:lock:transaction:{transactionId}` 作为 Redis 锁。

## 测试请求

```bash
curl -X POST http://localhost:8080/fb/callback/balance \
  -H 'Content-Type: application/json' \
  -d '{"merchantUserId":"u1001","merchantId":"m1","currencyId":"CNY"}'
```

```bash
curl -X POST http://localhost:8080/fb/callback/order_pay \
  -H 'Content-Type: application/json' \
  -d '{"transactionId":"tx-1","merchantUserId":"u1001","merchantId":"m1","transactionType":"OUT","transferType":"BET","currencyId":"CNY","amount":10,"status":1}'
```

查询扣款结果：

```bash
curl -X POST http://localhost:8080/fb/callback/check_order_pay \
  -H 'Content-Type: application/json' \
  -d '{"transactionId":"tx-1","merchantUserId":"u1001","merchantId":"m1","transactionType":"OUT","currencyId":"CNY","amount":10,"status":1}'
```

## 后续生产化建议

- 用真实钱包账户库替换开发默认余额逻辑。
- 将交易流水和订单同步落 MySQL/PostgreSQL，Redis 保留幂等锁和热缓存。
- 根据 FB 正式文档替换签名、header 名、data service 拉单路径。
- 给 `/internal/**` 增加内网鉴权或 Spring Security。
- 增加对账任务，定期用 FB Data Service 拉单校验本地订单和资金流水。
- 增加业务指标监控：扣款失败率、余额不足率、回调耗时、重试次数、同步失败明细。
