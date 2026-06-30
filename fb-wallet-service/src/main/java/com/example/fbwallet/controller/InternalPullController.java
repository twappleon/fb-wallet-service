package com.example.fbwallet.controller;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fbwallet.api.ApiResponse;
import com.example.fbwallet.service.DataPullService;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/internal/fb")
public class InternalPullController {

    private final DataPullService dataPullService;

    public InternalPullController(DataPullService dataPullService) {
        this.dataPullService = dataPullService;
    }

    @PostMapping("/pull/orders")
    ApiResponse<JsonNode> pullOrders(@RequestBody PullOrdersRequest request) {
        return ApiResponse.ok(dataPullService.pullOrdersByIds(request.orderIds()));
    }

    public record PullOrdersRequest(List<String> orderIds) {
    }
}
