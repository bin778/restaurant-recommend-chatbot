package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// 이 컨트롤러의 모든 API는 ADMIN 역할이 있어야만 호출 가능
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    // 전체 회원 목록 조회 API
    @GetMapping("/users")
    public ResponseEntity<List<UserDto.AdminUserInfo>> getAllUsers() {
        List<UserDto.AdminUserInfo> users = userService.getAllUsersForAdmin();
        return ResponseEntity.ok(users);
    }
}