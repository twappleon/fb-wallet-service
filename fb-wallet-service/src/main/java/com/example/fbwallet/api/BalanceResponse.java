package com.example.fbwallet.api;

import java.math.BigDecimal;

public record BalanceResponse(BigDecimal balance, String currencyId) {
}
