package com.example.chatbot.dto;

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
}