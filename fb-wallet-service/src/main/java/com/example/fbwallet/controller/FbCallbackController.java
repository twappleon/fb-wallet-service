package com.example.fbwallet.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fbwallet.api.ApiResponse;
import com.example.fbwallet.api.BalanceRequest;
import com.example.fbwallet.api.BalanceResponse;
import com.example.fbwallet.api.FailedTransaction;
import com.example.fbwallet.api.TransactionRequest;
import com.example.fbwallet.service.WalletCallbackService;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping(path = "/fb/callback", produces = MediaType.APPLICATION_JSON_VALUE)
public class FbCallbackController {

    private final WalletCallbackService callbackService;

    public FbCallbackController(WalletCallbackService callbackService) {
        this.callbackService = callbackService;
    }

    @PostMapping("/health")
    ApiResponse<Void> health() {
        return ApiResponse.ok(null);
    }

    @PostMapping("/balance")
    ApiResponse<BalanceResponse> balance(@Valid @RequestBody BalanceRequest request) {
        return ApiResponse.ok(callbackService.getBalance(request));
    }

    @PostMapping("/order_pay")
    ApiResponse<Void> orderPay(@Valid @RequestBody TransactionRequest request) {
        return callbackService.payOrder(request);
    }

    @PostMapping("/check_order_pay")
    ApiResponse<Void> checkOrderPay(@Valid @RequestBody TransactionRequest request) {
        return callbackService.checkOrderPay(request);
    }

    @PostMapping("/sync_transaction")
    ApiResponse<List<FailedTransaction>> syncTransaction(@RequestBody JsonNode payload) {
        return callbackService.syncTransactions(payload);
    }

    @PostMapping("/sync_orders")
    ApiResponse<Void> syncOrders(@RequestBody JsonNode payload) {
        callbackService.syncOrders(payload);
        return ApiResponse.ok(null);
    }

    @PostMapping("/sync_cashout")
    ApiResponse<Void> syncCashout(@RequestBody JsonNode payload) {
        callbackService.syncCashout(payload);
        return ApiResponse.ok(null);
    }
}
