package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.UserService;
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

    // --- 전체 회원 목록 조회 API ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDto.AdminUserInfo>> getAllUsers() {
        List<UserDto.AdminUserInfo> users = userService.getAllUsersForAdmin();
        return ResponseEntity.ok(users);
    }

    // --- 특정 회원 삭제 API ---
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser( // [수정] 반환 타입을 ResponseEntity<?>로 변경
                                         @PathVariable Long id,
                                         @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 본인 계정은 삭제할 수 없도록 서비스 로직에서 처리
            userService.deleteUserByAdmin(id, userDetails.getUsername());
            return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답

        } catch (IllegalArgumentException e) {
            // 자신을 삭제할 수 없다"는 예외를 명시적으로 처리
            // 400 Bad Request 상태 코드와 함께 명확한 에러 메시지를 반환합니다.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (Exception e) {
            // 그 외 예상치 못한 에러는 500 Internal Server Error로 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 삭제 중 오류가 발생했습니다.");
        }
    }
}