package com.example.chatbot.dto;

import com.example.chatbot.domain.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class UserDto {
    @Getter
    @Setter
    public static class SignupRequest {
        private String email;
        private String password;
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

        public static InfoResponse from(User user) {
            return InfoResponse.builder()
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .build();
        }
    }
}
