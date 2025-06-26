package com.example.chatbot.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_session")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatLog> chatLogs = new ArrayList<>();

    @Builder
    public ChatSession(User user, String title) {
        this.user = user;
        this.title = title;
    }
}