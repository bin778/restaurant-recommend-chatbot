package com.example.chatbot.controller;

import com.example.chatbot.domain.User;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
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

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<UserDto.InfoResponse> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        // @AuthenticationPrincipal 어노테이션을 통해 현재 인증된 사용자의 정보를 가져옴
        User user = userService.findByEmail(userDetails.getUsername());
        UserDto.InfoResponse userInfo = UserDto.InfoResponse.from(user);
        return ResponseEntity.ok(userInfo);
    }

    // 내 정보 수정
    @PutMapping("/me")
    public ResponseEntity<String> updateMyInfo(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody UserDto.UpdateProfileRequest requestDto) {
        try {
            userService.updateProfile(userDetails.getUsername(), requestDto);
            return ResponseEntity.ok("회원 정보가 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMyAccount(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestBody UserDto.DeleteAccountRequest requestDto) {
        try {
            userService.deleteAccount(userDetails.getUsername(), requestDto);
            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
