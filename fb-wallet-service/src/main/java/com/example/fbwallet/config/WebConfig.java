package com.example.fbwallet.config;

import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.fbwallet.security.CallbackSecurityFilter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    RestClient fbRestClient(FbProperties properties, RestClient.Builder builder) {
        return builder.baseUrl(properties.getDataService().getBaseUrl()).build();
    }

    @Bean
    RestClientCustomizer restClientCustomizer() {
        return builder -> builder.defaultHeader("User-Agent", "fb-wallet-service/0.1");
    }

    @Bean
    CallbackSecurityFilter callbackSecurityFilter(FbProperties properties) {
        return new CallbackSecurityFilter(properties);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/mahjong-slot").setViewName("forward:/mahjong-slot/index.html");
        registry.addViewController("/mahjong-slot/").setViewName("forward:/mahjong-slot/index.html");
    }
}
