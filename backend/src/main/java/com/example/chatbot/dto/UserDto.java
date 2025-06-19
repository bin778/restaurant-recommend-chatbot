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

    // 사용자 정보 응답을 위한 내부 클래스 추가
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
