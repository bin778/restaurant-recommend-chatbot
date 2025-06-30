package com.example.chatbot.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class AuthDto {

    @Getter
    @Setter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Builder
    public static class LoginResponse {
        private String grantType;
        private String accessToken;
        private String nickname;
        private String role;
    }
}