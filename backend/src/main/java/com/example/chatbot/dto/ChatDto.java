package com.example.chatbot.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class ChatDto {

    @Getter
    @Setter
    @NoArgsConstructor // 기본 생성자를 위한 Lombok 어노테이션
    public static class ChatRequest {
        private String message;

        // userMessage를 받는 생성자를 직접 추가
        public ChatRequest(String message) {
            this.message = message;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor // 기본 생성자를 위한 Lombok 어노테이션
    public static class ChatResponse {
        private String reply;

        public ChatResponse(String reply) {
            this.reply = reply;
        }
    }
}
