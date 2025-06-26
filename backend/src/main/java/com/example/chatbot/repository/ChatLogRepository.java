package com.example.chatbot.repository;

import com.example.chatbot.domain.ChatLog;
import com.example.chatbot.domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {
    // 특정 세션의 모든 대화 기록을 시간순으로 조회
    List<ChatLog> findByChatSessionOrderByCreatedAtAsc(ChatSession chatSession);
}