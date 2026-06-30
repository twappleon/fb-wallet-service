package com.example.fbwallet.api;

import jakarta.validation.constraints.NotBlank;

public record BalanceRequest(
        @NotBlank String merchantUserId,
        String merchantId,
        String currencyId) {
}
