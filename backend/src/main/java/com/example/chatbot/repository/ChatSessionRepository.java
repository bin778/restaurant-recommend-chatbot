package com.example.chatbot.repository;

import com.example.chatbot.domain.ChatSession;
import com.example.chatbot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    // 사용자의 모든 채팅 세션을 최신순으로 조회
    List<ChatSession> findByUserOrderByCreatedAtDesc(User user);
    // 특정 세션이 해당 사용자의 소유인지 확인
    Optional<ChatSession> findByIdAndUser(Long id, User user);
}