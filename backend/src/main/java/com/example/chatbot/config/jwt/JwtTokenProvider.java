package com.example.chatbot.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKeyPlain;
    private SecretKey secretKey;

    // 토큰 유효시간 1시간
    private final long tokenValidTime = 60 * 60 * 1000L;

    // 순환 참조 문제를 해결하기 위해 @Lazy 어노테이션과 Setter 주입 방식 사용
    private UserDetailsService userDetailsService;

    @Autowired
    public void setUserDetailsService(@Lazy UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    // 객체 초기화, secretKey를 Base64로 인코딩
    @PostConstruct
    protected void init() {
        byte[] keyBytes = Base64.getEncoder().encode(secretKeyPlain.getBytes());
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // JWT 토큰 생성
    public String createToken(String userPk, String nickname) {
        Claims claims = Jwts.claims().subject(userPk).build();
        claims.put("nickname", nickname); // 닉네임 정보 추가
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + tokenValidTime))
                .signWith(secretKey)
                .compact();
    }

    // JWT 토큰에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUserPk(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // 토큰에서 회원 정보 추출
    public String getUserPk(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getSubject();
    }

    // 토큰의 유효성 + 만료일자 확인
    public boolean validateToken(String jwtToken) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(jwtToken);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}