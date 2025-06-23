package com.example.chatbot.service;

import com.example.chatbot.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final WebClient webClient; // WebClient 주입

    public String getLlmReply(String userMessage) {
        // Python FastAPI 서버의 /api/recommend 엔드포인트로 POST 요청을 보냅니다.
        ChatDto.ChatResponse response = webClient.post()
                .uri("/api/recommend")
                .body(Mono.just(new ChatDto.ChatRequest(userMessage)), ChatDto.ChatRequest.class)
                .retrieve() // 응답을 받음
                .bodyToMono(ChatDto.ChatResponse.class) // 응답 본문을 ChatResponse DTO로 변환
                // .block()은 비동기 스트림이 끝날 때까지 현재 스레드를 차단
                // TODO: 테스트나 간단한 구현에서는 편리하지만, 실제 서비스에서는 요청 처리 스레드를 낭비할 수 있으므로 전체 로직을 비동기적으로 구성
                .block();

        if (response != null) {
            return response.getReply();
        } else {
            return "죄송합니다, 챗봇 서버에서 응답을 받지 못했습니다.";
        }
    }
}
