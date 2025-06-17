package com.example.chatbot.controller;

import com.example.chatbot.dto.AuthDto;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserDto.SignupRequest requestDto) {
        try {
            userService.signup(requestDto);
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            // 서비스에서 던진 예외를 캐치하여 클라이언트에게 에러 메시지를 전달
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest requestDto) {
        try {
            AuthDto.LoginResponse responseDto = userService.login(requestDto);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
