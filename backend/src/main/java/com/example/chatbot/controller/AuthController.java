package com.example.chatbot.controller;

import com.example.chatbot.config.jwt.JwtTokenProvider;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import com.example.chatbot.service.LoginAttemptService;
import com.example.chatbot.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LoginAttemptService loginAttemptService;

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
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest requestDto, HttpServletRequest request) {
        String ip = getClientIP(request);

        // IP가 차단되었는지 먼저 확인
        if (loginAttemptService.isBlocked(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("너무 많은 로그인 시도를 하셨습니다. 잠시 후 다시 시도해주세요.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );

            // 로그인 성공 시, 실패 카운트 초기화
            loginAttemptService.loginSucceeded(ip);

            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            String token = jwtTokenProvider.createToken(email, user.getNickname());

            AuthDto.LoginResponse responseDto = AuthDto.LoginResponse.builder()
                    .grantType("Bearer")
                    .accessToken(token)
                    .nickname(user.getNickname())
                    .build();

            return ResponseEntity.ok(responseDto);

        } catch (BadCredentialsException e) {
            // 로그인 실패 시, 실패 카운트 증가
            loginAttemptService.loginFailed(ip);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    // 클라이언트 IP 주소를 가져오는 헬퍼 메서드
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
