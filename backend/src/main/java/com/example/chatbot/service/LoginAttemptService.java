package com.example.chatbot.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPT = 5;
    private final LoadingCache<String, Integer> attemptsCache;

    public LoginAttemptService() {
        // 5분 동안 캐시를 유지하고, 5분이 지나면 자동으로 항목을 삭제합니다.
        attemptsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) {
                        return 0;
                    }
                });
    }

    // 로그인 성공 시, 해당 IP의 실패 카운트를 초기화
    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    // 로그인 실패 시, 해당 IP의 실패 카운트를 1 증가
    public void loginFailed(String key) {
        int attempts = 0;
        try {
            attempts = attemptsCache.get(key);
        } catch (ExecutionException e) {
            attempts = 0;
        }
        attempts++;
        attemptsCache.put(key, attempts);
    }

    // 해당 IP가 차단되었는지 확인
    public boolean isBlocked(String key) {
        try {
            return attemptsCache.get(key) >= MAX_ATTEMPT;
        } catch (ExecutionException e) {
            return false;
        }
    }
}