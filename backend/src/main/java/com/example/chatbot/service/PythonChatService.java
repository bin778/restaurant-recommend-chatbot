package com.example.chatbot.service;

import com.example.chatbot.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PythonChatService {

    private final WebClient webClient;

    public String getLlmReply(List<ChatDto.MessageDto> messages) {
        ChatDto.PyChatRequest requestPayload = new ChatDto.PyChatRequest();
        requestPayload.setMessages(messages);

        try {
            ChatDto.ChatResponse response = webClient.post()
                    .uri("/api/recommend")
                    .body(Mono.just(requestPayload), ChatDto.PyChatRequest.class)
                    .retrieve()
                    .bodyToMono(ChatDto.ChatResponse.class)
                    .block();
            return (response != null) ? response.getReply() : "AI 서버에서 응답이 없습니다.";
        } catch (Exception e) {
            System.err.println("Python 서버 통신 오류: " + e.getMessage());
            return "챗봇 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
    }

    public String generateTitle(String firstMessage) {
        if (firstMessage.length() > 20) {
            return firstMessage.substring(0, 20) + "...";
        }
        return firstMessage;
    }
}