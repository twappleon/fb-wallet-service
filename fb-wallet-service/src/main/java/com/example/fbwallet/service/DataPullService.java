package com.example.fbwallet.service;

import java.time.Instant;
import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.example.fbwallet.client.FbDataServiceClient;
import com.example.fbwallet.config.FbProperties;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class DataPullService {

    private static final String ORDER_CURSOR = "orders";

    private final FbDataServiceClient dataServiceClient;
    private final WalletCallbackService callbackService;
    private final StringRedisTemplate redisTemplate;
    private final RedisKeyspace keys;
    private final FbProperties properties;

    public DataPullService(
            FbDataServiceClient dataServiceClient,
            WalletCallbackService callbackService,
            StringRedisTemplate redisTemplate,
            RedisKeyspace keys,
            FbProperties properties) {
        this.dataServiceClient = dataServiceClient;
        this.callbackService = callbackService;
        this.redisTemplate = redisTemplate;
        this.keys = keys;
        this.properties = properties;
    }

    public JsonNode pullOrdersByIds(List<String> orderIds) {
        JsonNode response = dataServiceClient.pullOrdersByIds(orderIds);
        callbackService.syncOrders(response.path("data"));
        return response;
    }

    public void pullChangedOrders() {
        if (!properties.getDataService().isPullEnabled()) {
            return;
        }
        String cursorKey = keys.pullCursor(ORDER_CURSOR);
        String cursor = redisTemplate.opsForValue().get(cursorKey);
        JsonNode response = dataServiceClient.pullOrdersAfterCursor(cursor);
        callbackService.syncOrders(response.path("data"));
        String nextCursor = response.path("nextCursor").asText("");
        redisTemplate.opsForValue().set(cursorKey, nextCursor.isBlank() ? Instant.now().toString() : nextCursor);
    }
}
