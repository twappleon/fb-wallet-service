package com.example.fbwallet.api;

public record ApiResponse<T>(boolean success, String message, T data, int code) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data, 0);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(false, message, null, code);
    }
}
