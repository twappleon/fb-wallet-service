package com.example.fbwallet.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.fbwallet.service.DataPullService;

@Component
public class DataPullScheduler {

    private final DataPullService dataPullService;

    public DataPullScheduler(DataPullService dataPullService) {
        this.dataPullService = dataPullService;
    }

    @Scheduled(fixedDelayString = "${fb.data-service.pull-delay-ms:300000}")
    void pullChangedOrders() {
        dataPullService.pullChangedOrders();
    }
}
