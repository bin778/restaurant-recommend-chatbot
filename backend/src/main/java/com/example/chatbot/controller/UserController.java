package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // --- 내 정보 조회 API ---
    @GetMapping("/me")
    public ResponseEntity<UserDto.UserInfo> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto.UserInfo userInfo = userService.getUserInfo(userDetails.getUsername());
        return ResponseEntity.ok(userInfo);
    }

    // --- 프로필 수정 API ---
    @PutMapping("/me")
    public ResponseEntity<String> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDto.UpdateProfileRequest requestDto) {
        try {
            userService.updateProfile(userDetails.getUsername(), requestDto);
            return ResponseEntity.ok("회원 정보가 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // --- 회원 탈퇴 API ---
    @PostMapping("/delete")
    public ResponseEntity<String> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDto.DeleteAccountRequest requestDto,
            HttpServletResponse response) {
        try {
            // 서비스 로직을 호출하여 계정 삭제를 시도
            userService.deleteAccount(userDetails.getUsername(), requestDto);

            // 로그아웃(쿠키 만료) 로직을 여기에 통합
            Cookie cookie = new Cookie("refreshToken", null);
            cookie.setMaxAge(0);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            response.addCookie(cookie);

            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("알 수 없는 오류가 발생했습니다.");
        }
    }
}