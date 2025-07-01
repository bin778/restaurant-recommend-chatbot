package com.example.chatbot.repository;

import com.example.chatbot.domain.BannedKeyword;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannedKeywordRepository extends JpaRepository<BannedKeyword, Long> {
    boolean existsByKeyword(String keyword);
}