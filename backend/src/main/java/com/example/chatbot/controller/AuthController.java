package com.example.chatbot.controller;

import com.example.chatbot.config.jwt.JwtTokenProvider;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import com.example.chatbot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager; // 주입
    private final JwtTokenProvider jwtTokenProvider;       // 주입
    private final UserRepository userRepository;             // 닉네임 조회를 위해 주입

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserDto.SignupRequest requestDto) {
        try {
            userService.signup(requestDto);
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest requestDto) {
        try {
            // AuthenticationManager를 통해 인증 시도
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );

            // 인증 성공 시, 사용자 정보로 JWT 생성
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            String token = jwtTokenProvider.createToken(email, user.getNickname());

            // 응답 DTO 생성 및 반환
            AuthDto.LoginResponse responseDto = AuthDto.LoginResponse.builder()
                    .grantType("Bearer")
                    .accessToken(token)
                    .nickname(user.getNickname())
                    .build();

            return ResponseEntity.ok(responseDto);

        } catch (BadCredentialsException e) {
            // 인증 실패 시 (비밀번호 틀림 등)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }
}
