package com.example.chatbot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        // Python FastAPI 서버의 주소를 기본 URL로 설정
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }
}