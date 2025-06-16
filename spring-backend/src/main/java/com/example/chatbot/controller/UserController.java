package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/signup")
    public String signup(UserDto.SignupRequest requestDto) {
        userService.signup(requestDto);
        return "redirect:/login"; // 회원가입 성공 시 로그인 페이지로 리다이렉트
    }
}
