package com.example.chatbot.service;

import com.example.chatbot.domain.BannedKeyword;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.BannedKeywordRepository;
import com.example.chatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    private final BannedKeywordRepository keywordRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;

    private void notifyPythonServerToRefresh() {
        webClient.post()
                .uri("/api/refresh-keywords")
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(aVoid -> System.out.println("✅ Python 서버에 키워드 목록 갱신 요청 성공"))
                .doOnError(error -> System.err.println("❌ Python 서버 갱신 요청 실패: " + error.getMessage()))
                .subscribe();
    }

    @Transactional(readOnly = true)
    public List<UserDto.KeywordResponse> getKeywords() {
        return keywordRepository.findAll().stream()
                .map(k -> UserDto.KeywordResponse.builder()
                        .id(k.getId())
                        .keyword(k.getKeyword())
                        .adminNickname(k.getAdmin().getNickname())
                        .createdAt(k.getCreatedAt()).build())
                .collect(Collectors.toList());
    }

    public UserDto.KeywordResponse addKeyword(String keyword, String adminEmail) {
        if (keywordRepository.existsByKeyword(keyword)) {
            throw new IllegalArgumentException("이미 등록된 키워드입니다.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("관리자 정보를 찾을 수 없습니다."));

        BannedKeyword newKeyword = BannedKeyword.builder()
                .keyword(keyword)
                .admin(admin)
                .build();

        BannedKeyword savedKeyword = keywordRepository.save(newKeyword);

        notifyPythonServerToRefresh();

        return UserDto.KeywordResponse.builder()
                .id(savedKeyword.getId())
                .keyword(savedKeyword.getKeyword())
                .adminNickname(admin.getNickname())
                .createdAt(savedKeyword.getCreatedAt()).build();
    }

    public void deleteKeyword(Long id) {
        keywordRepository.deleteById(id);
        notifyPythonServerToRefresh();
    }
}