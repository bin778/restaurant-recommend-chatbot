package com.example.chatbot.controller;

import com.example.chatbot.domain.User; // User 엔티티 import
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            // UserDetails에서 사용자 이름(이메일)을 가져와 모델에 추가
            model.addAttribute("username", userDetails.getUsername());
        }
        return "home"; // templates/home.html 렌더링
    }
}