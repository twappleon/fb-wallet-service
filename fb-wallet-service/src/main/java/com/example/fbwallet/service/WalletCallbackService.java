package com.example.fbwallet.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.example.fbwallet.api.ApiResponse;
import com.example.fbwallet.api.BalanceRequest;
import com.example.fbwallet.api.BalanceResponse;
import com.example.fbwallet.api.FailedTransaction;
import com.example.fbwallet.api.TransactionRequest;
import com.example.fbwallet.config.FbProperties;
import com.example.fbwallet.model.OrderRecord;
import com.example.fbwallet.model.TransactionRecord;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WalletCallbackService {

    private static final String OUT = "OUT";
    private static final String IN = "IN";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final FbProperties properties;
    private final RedisKeyspace keys;

    public WalletCallbackService(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            FbProperties properties,
            RedisKeyspace keys) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.properties = properties;
        this.keys = keys;
    }

    public BalanceResponse getBalance(BalanceRequest request) {
        String currencyId = currencyOrDefault(request.currencyId());
        String key = keys.balance(request.merchantUserId(), currencyId);
        String value = redisTemplate.opsForValue().get(key);
        BigDecimal balance = value == null ? properties.getWallet().getInitialBalance() : new BigDecimal(value);
        return new BalanceResponse(money(balance), currencyId);
    }

    public ApiResponse<Void> payOrder(TransactionRequest request) {
        ApiResponse<Void> merchantCheck = validateMerchant(request.merchantId());
        if (merchantCheck != null) {
            return merchantCheck;
        }

        TransactionRecord existing = readTransaction(request.transactionId());
        if (existing != null) {
            return responseFromRecord(existing);
        }

        String lockKey = keys.transactionLock(request.transactionId());
        String lockValue = UUID.randomUUID().toString();
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue, properties.getRedis().getLockTtl());
        if (!Boolean.TRUE.equals(locked)) {
            TransactionRecord inFlightResult = readTransaction(request.transactionId());
            return inFlightResult == null ? ApiResponse.fail(6, "transaction is processing") : responseFromRecord(inFlightResult);
        }

        try {
            TransactionRecord afterLockExisting = readTransaction(request.transactionId());
            if (afterLockExisting != null) {
                return responseFromRecord(afterLockExisting);
            }
            TransactionRecord record = processTransaction(request);
            writeJson(keys.transaction(request.transactionId()), record, properties.getRedis().getTransactionTtl());
            return responseFromRecord(record);
        } finally {
            String currentLock = redisTemplate.opsForValue().get(lockKey);
            if (Objects.equals(currentLock, lockValue)) {
                redisTemplate.delete(lockKey);
            }
        }
    }

    public ApiResponse<Void> checkOrderPay(TransactionRequest request) {
        TransactionRecord record = readTransaction(request.transactionId());
        if (record == null) {
            return ApiResponse.fail(1, "transaction not found");
        }
        return responseFromRecord(record);
    }

    public ApiResponse<List<FailedTransaction>> syncTransactions(JsonNode payload) {
        List<FailedTransaction> failed = new ArrayList<>();
        for (JsonNode node : transactionNodes(payload)) {
            try {
                TransactionRequest request = objectMapper.treeToValue(node, TransactionRequest.class);
                ApiResponse<Void> response = payOrder(request);
                if (response.code() != 0) {
                    failed.add(new FailedTransaction(request.transactionId()));
                }
            } catch (Exception ex) {
                String transactionId = node.path("transactionId").asText("");
                failed.add(new FailedTransaction(transactionId));
            }
        }
        return ApiResponse.ok(failed);
    }

    public void syncOrders(JsonNode payload) {
        for (JsonNode node : payloadNodes(payload)) {
            String orderId = node.path("id").asText("");
            if (!StringUtils.hasText(orderId)) {
                continue;
            }
            long incomingVersion = node.path("version").asLong(0);
            String key = keys.order(orderId);
            OrderRecord existing = readJson(key, OrderRecord.class);
            if (existing == null || incomingVersion >= existing.version()) {
                writeJson(key, new OrderRecord(orderId, incomingVersion, node.deepCopy(), Instant.now()), properties.getRedis().getOrderTtl());
            }
        }
    }

    public void syncCashout(JsonNode payload) {
        for (JsonNode node : payloadNodes(payload)) {
            String cashoutId = node.path("id").asText("");
            if (StringUtils.hasText(cashoutId)) {
                writeJson(keys.cashout(cashoutId), node.deepCopy(), properties.getRedis().getOrderTtl());
            }
        }
    }

    private TransactionRecord processTransaction(TransactionRequest request) {
        String currencyId = currencyOrDefault(request.currencyId());
        if (request.status() != null && request.status() == 0) {
            return record(request, 1, "transaction status is failure");
        }

        BigDecimal amount = money(request.amount());
        String balanceKey = keys.balance(request.merchantUserId(), currencyId);
        BigDecimal balance = currentBalance(balanceKey);

        if (OUT.equalsIgnoreCase(request.transactionType())) {
            if (balance.compareTo(amount) < 0) {
                return record(request, 9, "balance is not enough");
            }
            redisTemplate.opsForValue().set(balanceKey, money(balance.subtract(amount)).toPlainString());
            return record(request, 0, null);
        }

        if (IN.equalsIgnoreCase(request.transactionType())) {
            redisTemplate.opsForValue().set(balanceKey, money(balance.add(amount)).toPlainString());
            return record(request, 0, null);
        }

        return record(request, 1, "unsupported transaction type");
    }

    private BigDecimal currentBalance(String balanceKey) {
        String value = redisTemplate.opsForValue().get(balanceKey);
        return value == null ? properties.getWallet().getInitialBalance() : new BigDecimal(value);
    }

    private TransactionRecord record(TransactionRequest request, int code, String message) {
        return new TransactionRecord(
                request.transactionId(),
                request.merchantUserId(),
                request.businessId(),
                request.transactionType(),
                request.transferType(),
                currencyOrDefault(request.currencyId()),
                money(request.amount()),
                code,
                message,
                Instant.now());
    }

    private ApiResponse<Void> responseFromRecord(TransactionRecord record) {
        if (record.success()) {
            return ApiResponse.ok(null);
        }
        return ApiResponse.fail(record.code(), record.message());
    }

    private ApiResponse<Void> validateMerchant(String merchantId) {
        String expected = properties.getCallback().getMerchantId();
        if (!StringUtils.hasText(expected) || Objects.equals(expected, merchantId)) {
            return null;
        }
        return ApiResponse.fail(1, "merchantId is invalid");
    }

    private String currencyOrDefault(String currencyId) {
        return StringUtils.hasText(currencyId) ? currencyId : properties.getWallet().getDefaultCurrency();
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private List<JsonNode> transactionNodes(JsonNode payload) {
        return payloadNodes(payload);
    }

    private List<JsonNode> payloadNodes(JsonNode payload) {
        List<JsonNode> nodes = new ArrayList<>();
        if (payload == null || payload.isNull()) {
            return nodes;
        }
        if (payload.isArray()) {
            payload.forEach(nodes::add);
            return nodes;
        }
        JsonNode data = payload.path("data");
        if (data.isArray()) {
            data.forEach(nodes::add);
            return nodes;
        }
        nodes.add(payload);
        return nodes;
    }

    private TransactionRecord readTransaction(String transactionId) {
        return readJson(keys.transaction(transactionId), TransactionRecord.class);
    }

    private <T> T readJson(String key, Class<T> type) {
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return null;
        }
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot read Redis JSON value: " + key, ex);
        }
    }

    private void writeJson(String key, Object value, java.time.Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(value), ttl);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Cannot write Redis JSON value: " + key, ex);
        }
    }
}
