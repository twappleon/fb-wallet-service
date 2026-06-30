package com.example.fbwallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.example.fbwallet.config.FbProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(FbProperties.class)
public class FbWalletServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FbWalletServiceApplication.class, args);
	}

}
