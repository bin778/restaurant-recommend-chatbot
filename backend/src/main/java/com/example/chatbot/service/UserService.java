package com.example.chatbot.service;

import com.example.chatbot.domain.Role;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.regex.Pattern;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$";

    @Transactional // 쓰기 작업이므로 Transactional 어노테이션 추가
    public Long signup(UserDto.SignupRequest dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.findByNickname(dto.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }
        if (!Pattern.matches(PASSWORD_REGEX, dto.getPassword())) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 하며, 영문과 숫자를 모두 포함해야 합니다.");
        }
        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .nickname(dto.getNickname())
                .role(Role.ROLE_USER)
                .build();
        return userRepository.save(user).getId();
    }

    public UserDto.UserInfo getUserInfo(String email) {
        User user = findByEmail(email);
        return UserDto.UserInfo.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();
    }

    @Transactional
    public void updateProfile(String email, UserDto.UpdateProfileRequest dto) {
        User user = findByEmail(email);
        if (dto.getNickname() != null && !dto.getNickname().isBlank() && !dto.getNickname().equals(user.getNickname())) {
            userRepository.findByNickname(dto.getNickname()).ifPresent(existedUser -> {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            });
            user.setNickname(dto.getNickname());
        }
        if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
            if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
                throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
            }
            if (!Pattern.matches(PASSWORD_REGEX, dto.getNewPassword())) {
                throw new IllegalArgumentException("비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.");
            }
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }
    }

    @Transactional
    public void deleteAccount(String email, UserDto.DeleteAccountRequest dto) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }
        userRepository.delete(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자를 찾을 수 없습니다: " + email));
    }

    // 관리자를 위한 전체 회원 목록 조회 서비스
    public List<UserDto.AdminUserInfo> getAllUsersForAdmin() {
        return userRepository.findAll().stream()
                .map(user -> UserDto.AdminUserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .nickname(user.getNickname())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 관리자에 의한 회원 삭제 서비스
    @Transactional
    public void deleteUserByAdmin(Long userIdToDelete, String adminEmail) {
        // 관리자 자신의 정보 조회
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("관리자 정보를 찾을 수 없습니다."));

        // 삭제 대상이 관리자 본인인지 확인
        if (admin.getId().equals(userIdToDelete)) {
            throw new IllegalArgumentException("관리자는 자신의 계정을 삭제할 수 없습니다.");
        }

        userRepository.deleteById(userIdToDelete);
    }
}