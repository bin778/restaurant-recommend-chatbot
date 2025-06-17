package com.example.chatbot.repository;

import com.example.chatbot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 이메일로 사용자를 찾는 메서드
    Optional<User> findByEmail(String email);

    // 닉네임으로 사용자를 찾는 메서드 추가 (로그인 시 사용)
    Optional<User> findByNickname(String nickname);
}
