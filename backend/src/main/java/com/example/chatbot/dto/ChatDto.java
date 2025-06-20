package com.example.chatbot.dto;

import lombok.Getter;
import lombok.Setter;

public class ChatDto {
    // 프론트엔드 -> 백엔드 요청
    @Getter
    @Setter
    public static class ChatRequest {
        private String message;
    }

    // 백엔드 -> 프론트엔드 응답
    @Getter
    @Setter
    public static class ChatResponse {
        private String reply;

        public ChatResponse(String reply) {
            this.reply = reply;
        }
    }
}
