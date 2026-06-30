package com.example.fbwallet.client;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.example.fbwallet.config.FbProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class FbDataServiceClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final FbProperties properties;

    public FbDataServiceClient(RestClient fbRestClient, ObjectMapper objectMapper, FbProperties properties) {
        this.restClient = fbRestClient;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    public JsonNode post(String path, JsonNode payload) {
        String body = payload == null ? "{}" : payload.toString();
        String timestamp = Long.toString(Instant.now().toEpochMilli());
        return restClient.post()
                .uri(path)
                .header("X-FB-Timestamp", timestamp)
                .header("X-FB-Signature", signature(timestamp, path, body))
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode pullOrdersByIds(Iterable<String> orderIds) {
        ObjectNode payload = objectMapper.createObjectNode();
        var ids = payload.putArray("ids");
        for (String orderId : orderIds) {
            ids.add(orderId);
        }
        return post("/fb/data/api/v2/order/listByIds", payload);
    }

    public JsonNode pullOrdersAfterCursor(String cursor) {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("cursor", cursor == null ? "" : cursor);
        return post("/fb/data/api/v2/order/pull", payload);
    }

    private String signature(String timestamp, String path, String body) {
        String payload = timestamp + "\nPOST\n" + path + "\n" + body;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getDataService().getAppSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot calculate data service signature", ex);
        }
    }
}
