package com.example.chatbot.config.jwt;

import io.jsonwebtoken.JwtBuilder;
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
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKeyPlain;
    private SecretKey secretKey;

    @Value("${jwt.access-token-validity-in-seconds}")
    private long accessTokenValidityInSeconds;

    @Value("${jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenValidityInSeconds;

    private UserDetailsService userDetailsService;

    @Autowired
    public void setUserDetailsService(@Lazy UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @PostConstruct
    protected void init() {
        byte[] keyBytes = Base64.getEncoder().encode(secretKeyPlain.getBytes());
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // 토큰 생성 메소드에 role 파라미터 추가
    public String createAccessToken(String userPk, String nickname, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("nickname", nickname);
        claims.put("role", role); // role 정보를 클레임에 추가
        return createToken(userPk, claims, accessTokenValidityInSeconds);
    }

    public String createRefreshToken(String userPk) {
        return createToken(userPk, null, refreshTokenValidityInSeconds);
    }

    private String createToken(String userPk, Map<String, Object> claims, long validityInSeconds) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + TimeUnit.SECONDS.toMillis(validityInSeconds));

        JwtBuilder builder = Jwts.builder()
                .subject(userPk)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey);

        if (claims != null) {
            builder.claims(claims);
        }

        return builder.compact();
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUserPk(token));
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    public String getUserPk(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String jwtToken) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(jwtToken);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}