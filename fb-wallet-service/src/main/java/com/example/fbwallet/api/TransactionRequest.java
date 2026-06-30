package com.example.fbwallet.api;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TransactionRequest(
        @NotBlank String transactionId,
        String userId,
        String merchantId,
        @NotBlank String merchantUserId,
        String businessId,
        String transactionType,
        String transferType,
        String currencyId,
        @NotNull BigDecimal amount,
        Integer status,
        String relatedId,
        String thirdRemark,
        Long createTime) {
}
