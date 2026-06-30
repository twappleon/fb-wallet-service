package com.example.fbwallet.model;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionRecord(
        String transactionId,
        String merchantUserId,
        String businessId,
        String transactionType,
        String transferType,
        String currencyId,
        BigDecimal amount,
        int code,
        String message,
        Instant processedAt) {

    public boolean success() {
        return code == 0;
    }
}
