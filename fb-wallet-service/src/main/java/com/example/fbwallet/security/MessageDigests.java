package com.example.fbwallet.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

final class MessageDigests {

    private MessageDigests() {
    }

    static boolean constantTimeEquals(String left, String right) {
        byte[] leftBytes = normalize(left);
        byte[] rightBytes = normalize(right);
        return MessageDigest.isEqual(leftBytes, rightBytes);
    }

    private static byte[] normalize(String value) {
        return value == null ? new byte[0] : value.trim().toLowerCase().getBytes(StandardCharsets.UTF_8);
    }
}
