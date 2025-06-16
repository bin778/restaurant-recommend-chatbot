package com.example.chatbot.controller;

import com.example.chatbot.repository.UserRepository;
import com.example.chatbot.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final UserRepository userRepository;

    @GetMapping("/")
    public String home(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            // UserDetails에서 사용자 이메일을 가져옴
            String email = userDetails.getUsername();
            // 이메일을 사용해 User 엔티티를 찾습니다.
            User user = userRepository.findByEmail(email).orElse(null);

            // User 엔티티에서 닉네임을 모델에 추가
            if (user != null) {
                model.addAttribute("nickname", user.getNickname());
            }
        }
        return "home";
    }
}