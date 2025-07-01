package com.example.chatbot.controller;

import com.example.chatbot.dto.UserDto;
import com.example.chatbot.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDataController {
    private final AdminService adminService;

    @GetMapping("/filtered-keywords")
    public ResponseEntity<List<String>> getPublicKeywords() {
        List<String> keywords = adminService.getKeywords().stream()
                .map(UserDto.KeywordResponse::getKeyword)
                .collect(Collectors.toList());
        return ResponseEntity.ok(keywords);
    }
}