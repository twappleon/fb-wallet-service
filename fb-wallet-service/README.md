# FB 体育免转钱包后端服务

Spring Boot + Redis 实现的 FB 体育 single wallet 对接骨架，包含：

- `/fb/callback/balance` 余额查询
- `/fb/callback/order_pay` 下注扣款
- `/fb/callback/check_order_pay` 扣款状态补查
- `/fb/callback/sync_transaction` 流水同步
- `/fb/callback/sync_orders` 订单同步，按 `version` 防止旧数据覆盖
- `/fb/callback/sync_cashout` 提前结算同步
- `/fb/callback/health` 健康检查
- `/internal/fb/pull/orders` 内部主动拉单入口

## 启动

```bash
docker run --rm -p 6379:6379 redis:7
./mvnw spring-boot:run
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

> 目前签名实现为占位的 `HMAC-SHA256(timestamp + method + path + body)`。拿到 FB 正式签名字段和算法后，只需要调整 `CallbackSecurityFilter` 和 `FbDataServiceClient`。

## Redis Key 设计

- `fb:wallet:balance:{merchantUserId}:{currencyId}`：用户余额
- `fb:transaction:{transactionId}`：资金流水幂等记录
- `fb:lock:transaction:{transactionId}`：扣款分布式锁
- `fb:order:{orderId}`：订单原始数据和版本
- `fb:cashout:{cashoutId}`：提前结算原始数据
- `fb:pull:cursor:orders`：主动拉单游标

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

## 后续生产化建议

- 用真实钱包账户库替换开发默认余额逻辑。
- 将交易流水和订单同步落 MySQL/PostgreSQL，Redis 保留幂等锁和热缓存。
- 根据 FB 正式文档替换签名、header 名、data service 拉单路径。
- 给 `/internal/**` 增加内网鉴权或 Spring Security。
