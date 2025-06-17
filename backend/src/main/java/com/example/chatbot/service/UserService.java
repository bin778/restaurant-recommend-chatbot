package com.example.chatbot.service;

import com.example.chatbot.config.jwt.JwtTokenProvider;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Long signup(UserDto.SignupRequest dto) {
        // 이메일 중복 확인
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            // 구체적인 에러 메시지를 던져서 프론트에서 활용할 수 있게 합니다.
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        // 닉네임 중복 확인 로직 추가
        if (userRepository.findByNickname(dto.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword())) // 비밀번호 암호화
                .nickname(dto.getNickname())
                .role("ROLE_USER") // 기본 역할 부여
                .build();

        return userRepository.save(user).getId();
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

        return new org.springframework.security.core.userdetails.User(user.getEmail(),
                user.getPassword(),
                Collections.singletonList(() -> user.getRole()));
    }
}
