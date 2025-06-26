package com.example.chatbot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession chatSession;

    @Column(nullable = false, length = 50)
    private String sender;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ChatLog(ChatSession chatSession, String sender, String message) {
        this.chatSession = chatSession;
        this.sender = sender;
        this.message = message;
    }
}