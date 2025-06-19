package com.example.chatbot.domain;

import jakarta.persistence.*;
import lombok.*; // Setter를 사용하기 위해 임포트
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Setter // password 필드에 대한 Setter 추가
    @Column(nullable = false)
    private String password;

    @Setter // nickname 필드에 대한 Setter 추가
    @Column(unique = true, nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public User(String email, String password, String nickname, String role) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
    }
}
