package com.example.chatbot.controller;

import com.example.chatbot.dto.ChatDto;
import com.example.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatDto.ChatResponse> handleChatMessage(@RequestBody ChatDto.ChatRequest request) {
        String reply = chatService.getLlmReply(request.getMessage());
        return ResponseEntity.ok(new ChatDto.ChatResponse(reply));
    }
}