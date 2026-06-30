package com.example.fbwallet.model;

import java.time.Instant;

import com.fasterxml.jackson.databind.JsonNode;

public record OrderRecord(String orderId, long version, JsonNode payload, Instant updatedAt) {
}
