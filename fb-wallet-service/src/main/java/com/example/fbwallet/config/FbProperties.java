package com.example.fbwallet.config;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fb")
public class FbProperties {

    private final Callback callback = new Callback();
    private final Redis redis = new Redis();
    private final DataService dataService = new DataService();
    private final Wallet wallet = new Wallet();

    public Callback getCallback() {
        return callback;
    }

    public Redis getRedis() {
        return redis;
    }

    public DataService getDataService() {
        return dataService;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public static class Callback {
        private boolean signatureEnabled = false;
        private String secret = "change-me";
        private Duration timestampSkew = Duration.ofMinutes(5);
        private List<String> allowedIps = new ArrayList<>();
        private String merchantId = "";

        public boolean isSignatureEnabled() {
            return signatureEnabled;
        }

        public void setSignatureEnabled(boolean signatureEnabled) {
            this.signatureEnabled = signatureEnabled;
        }

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public Duration getTimestampSkew() {
            return timestampSkew;
        }

        public void setTimestampSkew(Duration timestampSkew) {
            this.timestampSkew = timestampSkew;
        }

        public List<String> getAllowedIps() {
            return allowedIps;
        }

        public void setAllowedIps(List<String> allowedIps) {
            this.allowedIps = allowedIps;
        }

        public String getMerchantId() {
            return merchantId;
        }

        public void setMerchantId(String merchantId) {
            this.merchantId = merchantId;
        }
    }

    public static class Redis {
        private String prefix = "fb";
        private Duration lockTtl = Duration.ofSeconds(10);
        private Duration transactionTtl = Duration.ofDays(30);
        private Duration orderTtl = Duration.ofDays(90);

        public String getPrefix() {
            return prefix;
        }

        public void setPrefix(String prefix) {
            this.prefix = prefix;
        }

        public Duration getLockTtl() {
            return lockTtl;
        }

        public void setLockTtl(Duration lockTtl) {
            this.lockTtl = lockTtl;
        }

        public Duration getTransactionTtl() {
            return transactionTtl;
        }

        public void setTransactionTtl(Duration transactionTtl) {
            this.transactionTtl = transactionTtl;
        }

        public Duration getOrderTtl() {
            return orderTtl;
        }

        public void setOrderTtl(Duration orderTtl) {
            this.orderTtl = orderTtl;
        }
    }

    public static class DataService {
        private boolean pullEnabled = false;
        private String baseUrl = "https://api.example.com";
        private String appSecret = "change-me";
        private Duration pullDelay = Duration.ofMinutes(5);

        public boolean isPullEnabled() {
            return pullEnabled;
        }

        public void setPullEnabled(boolean pullEnabled) {
            this.pullEnabled = pullEnabled;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }

        public Duration getPullDelay() {
            return pullDelay;
        }

        public void setPullDelay(Duration pullDelay) {
            this.pullDelay = pullDelay;
        }
    }

    public static class Wallet {
        private String defaultCurrency = "CNY";
        private BigDecimal initialBalance = BigDecimal.ZERO;

        public String getDefaultCurrency() {
            return defaultCurrency;
        }

        public void setDefaultCurrency(String defaultCurrency) {
            this.defaultCurrency = defaultCurrency;
        }

        public BigDecimal getInitialBalance() {
            return initialBalance;
        }

        public void setInitialBalance(BigDecimal initialBalance) {
            this.initialBalance = initialBalance;
        }
    }
}
