package com.example.chatbot.repository;

import com.example.chatbot.domain.ChatLog;
import com.example.chatbot.domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {
    List<ChatLog> findByChatSessionOrderByCreatedAtAsc(ChatSession chatSession);
}