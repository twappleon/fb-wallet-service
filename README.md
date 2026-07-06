# FB Sports Wallet Service

FB 体育免转钱包后端服务，基于 Spring Boot 和 Redis 实现。项目用于对接 FB Sports single wallet 模式，由商户侧维护玩家余额，FB 体育通过 callback 接口完成余额查询、下注扣款、扣款状态确认、交易流水同步、订单同步和提前结算同步。

## 项目结构

```text
.
├── pom.xml                    # Maven 聚合工程
└── fb-wallet-service          # 免转钱包服务
    ├── pom.xml
    ├── docker-compose.yml     # 本地 Redis
    └── src/main
```

## 功能范围

- 余额查询：`POST /fb/callback/balance`
- 下注扣款：`POST /fb/callback/order_pay`
- 扣款状态补查：`POST /fb/callback/check_order_pay`
- 交易流水同步：`POST /fb/callback/sync_transaction`
- 订单同步：`POST /fb/callback/sync_orders`
- 提前结算同步：`POST /fb/callback/sync_cashout`
- 服务健康检查：`POST /fb/callback/health`
- 内部主动拉单：`POST /internal/fb/pull/orders`
- 麻将 slot demo：`GET /mahjong-slot/`

## 技术栈

- Java 21
- Spring Boot 3.5
- Spring Web
- Spring Data Redis
- Spring Validation
- Spring Actuator
- Maven Wrapper
- Docker Compose for Redis

## 快速启动

```bash
cd fb-wallet-service
docker compose up -d redis
./mvnw spring-boot:run
```

健康检查：

```bash
curl http://localhost:8080/actuator/health
```

FB callback 健康检查：

```bash
curl -X POST http://localhost:8080/fb/callback/health \
  -H 'Content-Type: application/json' \
  -d '{}'
```

麻将 slot demo：

```text
http://localhost:8080/mahjong-slot/
```

## 构建与测试

在仓库根目录执行：

```bash
cd fb-wallet-service
./mvnw test
```

## 配置说明

主要配置位于 `fb-wallet-service/src/main/resources/application.yml`。

生产环境至少需要配置：

```bash
export FB_MERCHANT_ID="your-merchant-id"
export FB_CALLBACK_SIGNATURE_ENABLED=true
export FB_CALLBACK_SECRET="fb-callback-secret"
export FB_CALLBACK_ALLOWED_IPS="1.2.3.4,5.6.7.8"
export FB_DATA_SERVICE_BASE_URL="https://fb-data-service-domain"
export FB_DATA_SERVICE_APP_SECRET="fb-data-service-secret"
```

## 重要说明

当前版本是对接骨架，已经把接口、幂等、Redis key、签名校验入口和 data service 客户端封装好。上线前需要根据 FB 正式商户文档确认：

- callback 签名 header 名称、签名串和算法
- FB Data Service 的真实域名、接口路径和签名规则
- 商户真实钱包余额来源
- 交易流水和订单是否需要落 MySQL/PostgreSQL
- `/internal/**` 内部接口鉴权策略

更多服务细节见 [fb-wallet-service/README.md](fb-wallet-service/README.md)。
