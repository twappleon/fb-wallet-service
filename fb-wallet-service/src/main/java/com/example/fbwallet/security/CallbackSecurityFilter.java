package com.example.fbwallet.security;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.HttpStatus;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.fbwallet.config.FbProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

public class CallbackSecurityFilter extends OncePerRequestFilter {

    private static final String SIGNATURE_HEADER = "X-FB-Signature";
    private static final String TIMESTAMP_HEADER = "X-FB-Timestamp";

    private final FbProperties properties;

    public CallbackSecurityFilter(FbProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/fb/callback/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CachedBodyRequest cachedRequest = new CachedBodyRequest(request);
        if (!isAllowedIp(cachedRequest)) {
            reject(response, HttpStatus.FORBIDDEN, "callback ip is not allowed");
            return;
        }
        if (properties.getCallback().isSignatureEnabled() && !hasValidSignature(cachedRequest)) {
            reject(response, HttpStatus.UNAUTHORIZED, "callback signature is invalid");
            return;
        }
        filterChain.doFilter(cachedRequest, response);
    }

    private boolean isAllowedIp(HttpServletRequest request) {
        List<String> allowedIps = properties.getCallback().getAllowedIps();
        List<String> effectiveAllowedIps = allowedIps == null
                ? List.of()
                : allowedIps.stream().filter(StringUtils::hasText).toList();
        if (effectiveAllowedIps.isEmpty()) {
            return true;
        }
        String ip = clientIp(request);
        return effectiveAllowedIps.stream().anyMatch(ip::equals);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean hasValidSignature(CachedBodyRequest request) {
        String timestamp = request.getHeader(TIMESTAMP_HEADER);
        String signature = request.getHeader(SIGNATURE_HEADER);
        if (timestamp == null || signature == null) {
            return false;
        }
        if (!isFresh(timestamp, properties.getCallback().getTimestampSkew())) {
            return false;
        }
        String payload = timestamp + "\n"
                + request.getMethod() + "\n"
                + request.getRequestURI() + "\n"
                + new String(request.body(), StandardCharsets.UTF_8);
        String expected = hmacSha256(payload, properties.getCallback().getSecret());
        return MessageDigests.constantTimeEquals(expected, signature);
    }

    private boolean isFresh(String timestamp, Duration allowedSkew) {
        try {
            long epochMillis = Long.parseLong(timestamp);
            Duration delta = Duration.between(Instant.ofEpochMilli(epochMillis), Instant.now()).abs();
            return delta.compareTo(allowedSkew) <= 0;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    private String hmacSha256(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot calculate callback signature", ex);
        }
    }

    private void reject(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\",\"data\":null,\"code\":1}");
    }

    private static class CachedBodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;

        CachedBodyRequest(HttpServletRequest request) throws IOException {
            super(request);
            this.body = StreamUtils.copyToByteArray(request.getInputStream());
        }

        byte[] body() {
            return body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream stream = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public int read() {
                    return stream.read();
                }

                @Override
                public boolean isFinished() {
                    return stream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    throw new UnsupportedOperationException();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
