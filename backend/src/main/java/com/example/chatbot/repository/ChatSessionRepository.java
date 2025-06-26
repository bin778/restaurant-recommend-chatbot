package com.example.chatbot.repository;

import com.example.chatbot.domain.ChatSession;
import com.example.chatbot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
    Optional<ChatSession> findByIdAndUser(Long id, User user);
}