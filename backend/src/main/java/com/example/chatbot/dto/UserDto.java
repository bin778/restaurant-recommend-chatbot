package com.example.chatbot.dto;

import com.example.chatbot.domain.Role;
import lombok.*;
import java.time.LocalDateTime;

public class UserDto {
    @Getter
    @Setter
    public static class SignupRequest {
        private String email;
        private String password;
        private String nickname;
    }

    @Getter
    @Builder
    public static class UserInfo {
        private String email;
        private String nickname;
    }

    @Getter
    @Setter
    public static class UpdateProfileRequest {
        private String nickname;
        private String newPassword;
        private String confirmPassword;
    }

    @Getter
    @Setter
    public static class DeleteAccountRequest {
        private String password;
    }

    @Getter
    @Builder
    public static class InfoResponse {
        private String email;
        private String nickname;
    }

    @Getter
    @Builder
    public static class AdminUserInfo {
        private Long id;
        private String email;
        private String nickname;
        private Role role;
        private LocalDateTime createdAt;
    }

    @Getter @Setter
    public static class KeywordRequest {
        private String keyword;
    }

    @Getter @Builder
    public static class KeywordResponse {
        private Long id;
        private String keyword;
        private String adminNickname; // 등록한 관리자의 닉네임
        private LocalDateTime createdAt;
    }
}
