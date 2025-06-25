package com.example.chatbot.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

public class ChatDto {

    @Getter
    @Setter
    @NoArgsConstructor // 기본 생성자 추가
    public static class MessageDto {
        private String sender;
        private String text;
    }

    @Getter
    @Setter
    @NoArgsConstructor // 기본 생성자 추가
    public static class ChatRequest {
        private List<MessageDto> messages;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ChatResponse {
        private String reply;
        public ChatResponse(String reply) { this.reply = reply; }
    }
}