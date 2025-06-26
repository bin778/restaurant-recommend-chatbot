package com.example.chatbot.service;

import com.example.chatbot.domain.*;
import com.example.chatbot.dto.ChatDto;
import com.example.chatbot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatLogRepository chatLogRepository;
    private final PythonChatService pythonChatService;
    private final UserRepository userRepository;

    public ChatDto.ChatResponse processMessage(String userEmail, ChatDto.UserChatRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        ChatSession session;

        if (request.getSessionId() == null) {
            String title = pythonChatService.generateTitle(request.getMessage());
            session = ChatSession.builder().user(user).title(title).build();
            chatSessionRepository.save(session);
        } else {
            session = chatSessionRepository.findByIdAndUser(request.getSessionId(), user)
                    .orElseThrow(() -> new IllegalArgumentException("Session not found or permission denied"));
        }

        chatLogRepository.save(ChatLog.builder().chatSession(session).sender("user").message(request.getMessage()).build());

        List<ChatLog> conversationLogs = chatLogRepository.findByChatSessionOrderByCreatedAtAsc(session);
        List<ChatDto.MessageDto> conversationDto = conversationLogs.stream()
                .map(log -> {
                    ChatDto.MessageDto dto = new ChatDto.MessageDto();
                    dto.setSender(log.getSender());
                    dto.setText(log.getMessage());
                    return dto;
                }).collect(Collectors.toList());

        String botReply = pythonChatService.getLlmReply(conversationDto);

        chatLogRepository.save(ChatLog.builder().chatSession(session).sender("bot").message(botReply).build());

        return new ChatDto.ChatResponse(session.getId(), botReply);
    }

    @Transactional(readOnly = true)
    public List<ChatDto.SessionInfo> getChatSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return chatSessionRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(session -> ChatDto.SessionInfo.builder()
                        .sessionId(session.getId())
                        .title(session.getTitle())
                        .createdAt(session.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatDto.MessageInfo> getMessages(Long sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ChatSession session = chatSessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found or permission denied"));
        return chatLogRepository.findByChatSessionOrderByCreatedAtAsc(session).stream()
                .map(log -> ChatDto.MessageInfo.builder().sender(log.getSender()).text(log.getMessage()).build())
                .collect(Collectors.toList());
    }

    public void deleteSession(Long sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatSession session = chatSessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new IllegalArgumentException("Session not found or permission denied"));

        chatSessionRepository.delete(session);
    }
}