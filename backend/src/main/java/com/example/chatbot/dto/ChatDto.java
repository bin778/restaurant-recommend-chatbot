package com.example.chatbot.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class ChatDto {
    // Python 서버와 통신할 때 사용하는 DTO
    @Getter @Setter @NoArgsConstructor
    public static class PyChatRequest { private List<MessageDto> messages; }

    @Getter @Setter public static class MessageDto { private String sender; private String text; }

    // 프론트엔드와 통신할 때 사용하는 DTO
    @Getter @Setter public static class UserChatRequest { private Long sessionId; private String message; }
    @Getter @Setter @AllArgsConstructor public static class ChatResponse { private Long sessionId; private String reply; }

    // 조회용 DTO
    @Getter @Builder public static class SessionInfo { private Long sessionId; private String title; private LocalDateTime createdAt; }
    @Getter @Builder public static class MessageInfo { private String sender; private String text; }
}