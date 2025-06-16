package com.example.chatbot.service;

import com.example.chatbot.domain.User;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.example.chatbot.config.jwt.JwtTokenProvider;
import com.example.chatbot.dto.AuthDto;
import java.util.Collections;

@Service
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signup(UserDto.SignupRequest dto) {
        // 이메일 중복 확인
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = User.builder()
                .email(dto.getEmail())
                .password(encodedPassword)
                .nickname(dto.getNickname())
                .role("ROLE_USER") // 기본 역할 부여
                .build();

        User savedUser = userRepository.save(user);
    }

    @Transactional
    public AuthDto.LoginResponse login(AuthDto.LoginRequest dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        // 로그인 성공 시 JWT 생성
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getNickname());

        return AuthDto.LoginResponse.builder()
                .grantType("Bearer")
                .accessToken(token)
                .nickname(user.getNickname())
                .build();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(user::getRole)
        );
    }
}