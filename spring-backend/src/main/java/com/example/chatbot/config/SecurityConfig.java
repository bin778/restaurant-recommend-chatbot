package com.example.chatbot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // 비밀번호 암호화를 위한 Bean 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Spring Security의 핵심 필터 체인 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authz -> authz
                        // 루트, 로그인, 회원가입, 정적 리소스는 모두 허용
                        .requestMatchers("/", "/login", "/signup", "/css/**", "/js/**").permitAll()
                        // '/admin/**' 경로는 ADMIN 역할을 가진 사용자만 접근 가능
                        // .requestMatchers("/admin/**").hasRole("ADMIN")
                        // 그 외 모든 요청은 인증된 사용자만 접근 가능
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        // 커스텀 로그인 페이지 경로
                        .loginPage("/login")
                        // 로그인 성공 시 이동할 기본 경로
                        .defaultSuccessUrl("/chat", true)
                        .permitAll())
                .logout(logout -> logout
                        // 로그아웃 성공 시 이동할 경로
                        .logoutSuccessUrl("/"));
        return http.build();
    }
}