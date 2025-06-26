package com.example.chatbot.controller;

import com.example.chatbot.dto.ChatDto;
import com.example.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 새로운 채팅 메시지 처리
    @PostMapping
    public ResponseEntity<ChatDto.ChatResponse> handleChatMessage(
            @RequestBody ChatDto.UserChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ChatDto.ChatResponse response = chatService.processMessage(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    // 사용자의 모든 채팅 세션 목록 조회
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatDto.SessionInfo>> getChatSessions(@AuthenticationPrincipal UserDetails userDetails) {
        List<ChatDto.SessionInfo> sessions = chatService.getChatSessions(userDetails.getUsername());
        return ResponseEntity.ok(sessions);
    }

    // 특정 세션의 모든 메시지 조회
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatDto.MessageInfo>> getMessages(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ChatDto.MessageInfo> messages = chatService.getMessages(sessionId, userDetails.getUsername());
        return ResponseEntity.ok(messages);
    }
}