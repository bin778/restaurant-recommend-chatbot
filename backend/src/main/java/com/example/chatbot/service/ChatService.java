package com.example.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class ChatService {
    public String getLlmReply(String userMessage) {
        // TODO: 추후 이 부분에서 WebClient 또는 RestTemplate을 사용하여 Python LLM 서버 (예: http://localhost:8000/recommend)에 userMessage를 보내고 응답을 받아 반환하는 로직을 구현
        // 현재는 테스트를 위해 사용자의 메시지를 그대로 따라하는 에코(Echo) 로직을 구현
        System.out.println("사용자 메시지: " + userMessage);
        String botReply = "봇: \"" + userMessage + "\" 라고 하셨네요!";
        return botReply;
    }
}