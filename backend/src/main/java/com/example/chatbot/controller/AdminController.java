package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // HttpStatus 임포트 추가
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;

    // 전체 회원 목록 관리 API
    @GetMapping("/users")
    public ResponseEntity<List<UserDto.AdminUserInfo>> getAllUsers() {
        List<UserDto.AdminUserInfo> users = userService.getAllUsersForAdmin();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.deleteUserByAdmin(id, userDetails.getUsername());
            return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 삭제 중 오류가 발생했습니다.");
        }
    }

    // 부적절 키워드 관리 API
    @GetMapping("/keywords")
    public ResponseEntity<List<UserDto.KeywordResponse>> getKeywords() {
        return ResponseEntity.ok(adminService.getKeywords());
    }

    @PostMapping("/keywords")
    public ResponseEntity<?> addKeyword(@RequestBody UserDto.KeywordRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UserDto.KeywordResponse newKeyword = adminService.addKeyword(request.getKeyword(), userDetails.getUsername());
            return ResponseEntity.ok(newKeyword);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/keywords/{id}")
    public ResponseEntity<Void> deleteKeyword(@PathVariable Long id) {
        adminService.deleteKeyword(id);
        return ResponseEntity.noContent().build();
    }
}