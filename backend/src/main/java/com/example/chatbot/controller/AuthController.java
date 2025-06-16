package com.example.chatbot.controller;

import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // 모든 요청의 기본 경로
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserDto.SignupRequest requestDto) {
        userService.signup(requestDto);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(@RequestBody AuthDto.LoginRequest requestDto) {
        AuthDto.LoginResponse responseDto = userService.login(requestDto);
        return ResponseEntity.ok(responseDto);
    }
}