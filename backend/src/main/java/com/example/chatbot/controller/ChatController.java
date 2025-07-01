package com.example.chatbot.controller;

import com.example.chatbot.dto.ChatDto;
import com.example.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // HttpStatus 임포트
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

    @PostMapping
    public ResponseEntity<ChatDto.ChatResponse> handleChatMessage(
            @RequestBody ChatDto.UserChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userEmail = userDetails.getUsername();
        ChatDto.ChatResponse response = chatService.processMessage(userEmail, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatDto.SessionInfo>> getChatSessions(@AuthenticationPrincipal UserDetails userDetails) {
        List<ChatDto.SessionInfo> sessions = chatService.getChatSessions(userDetails.getUsername());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long sessionId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ChatDto.MessageInfo> messages = chatService.getMessages(sessionId, userDetails.getUsername());
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteChatSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.deleteSession(sessionId, userDetails.getUsername());
        return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답
    }
}