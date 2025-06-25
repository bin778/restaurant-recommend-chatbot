package com.example.chatbot.service;

import com.example.chatbot.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final WebClient webClient;

    public String getLlmReply(ChatDto.ChatRequest chatRequest) {
        // chatRequest 객체 전체를 Python 서버로 전달합니다.
        ChatDto.ChatResponse response = webClient.post()
                .uri("/api/recommend")
                .body(Mono.just(chatRequest), ChatDto.ChatRequest.class)
                .retrieve()
                .bodyToMono(ChatDto.ChatResponse.class)
                .block();

        if (response != null) {
            return response.getReply();
        } else {
            return "죄송합니다, 챗봇 서버에서 응답을 받지 못했습니다.";
        }
    }
}

