package com.example.chatbot.controller;

import com.example.chatbot.config.jwt.JwtTokenProvider;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.LoginAttemptService;
import com.example.chatbot.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
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
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest requestDto, HttpServletRequest request, HttpServletResponse response) {
        String ip = getClientIP(request);

        if (loginAttemptService.isBlocked(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("너무 많은 로그인 시도를 하셨습니다. 잠시 후 다시 시도해주세요.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(requestDto.getEmail(), requestDto.getPassword())
            );

            loginAttemptService.loginSucceeded(ip);

            String email = authentication.getName();
            User user = userService.findByEmail(email); // 이메일로 User 엔티티 조회

            // 액세스 토큰 생성 시 역할(Role) 정보 전달
            String accessToken = jwtTokenProvider.createAccessToken(email, user.getNickname(), user.getRole().name());
            String refreshToken = jwtTokenProvider.createRefreshToken(email);

            Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(true);
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(refreshTokenCookie);

            // 로그인 응답에 역할(Role) 정보 포함
            AuthDto.LoginResponse responseDto = AuthDto.LoginResponse.builder()
                    .grantType("Bearer")
                    .accessToken(accessToken)
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .build();

            return ResponseEntity.ok(responseDto);

        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(ip);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Refresh Token");
        }

        String email = jwtTokenProvider.getUserPk(refreshToken);
        User user = userService.findByEmail(email);

        // 토큰 재발급 시에도 역할(Role) 정보 포함
        String newAccessToken = jwtTokenProvider.createAccessToken(email, user.getNickname(), user.getRole().name());

        // [수정] 응답에 역할(Role) 정보 포함
        AuthDto.LoginResponse responseDto = AuthDto.LoginResponse.builder()
                .grantType("Bearer")
                .accessToken(newAccessToken)
                .nickname(user.getNickname())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);

        cookie.setMaxAge(0);

        cookie.setHttpOnly(true);
        cookie.setSecure(true); // HTTPS 환경이므로 true
        cookie.setPath("/");

        response.addCookie(cookie);
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}