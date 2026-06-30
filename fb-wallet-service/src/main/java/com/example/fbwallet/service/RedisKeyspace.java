package com.example.fbwallet.service;

import org.springframework.stereotype.Component;

import com.example.fbwallet.config.FbProperties;

@Component
public class RedisKeyspace {

    private final String prefix;

    public RedisKeyspace(FbProperties properties) {
        this.prefix = properties.getRedis().getPrefix();
    }

    public String balance(String merchantUserId, String currencyId) {
        return prefix + ":wallet:balance:" + merchantUserId + ":" + currencyId;
    }

    public String transaction(String transactionId) {
        return prefix + ":transaction:" + transactionId;
    }

    public String transactionLock(String transactionId) {
        return prefix + ":lock:transaction:" + transactionId;
    }

    public String order(String orderId) {
        return prefix + ":order:" + orderId;
    }

    public String cashout(String cashoutId) {
        return prefix + ":cashout:" + cashoutId;
    }

    public String pullCursor(String name) {
        return prefix + ":pull:cursor:" + name;
    }
}
