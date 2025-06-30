package com.example.chatbot.service;

import com.example.chatbot.domain.Role;
import com.example.chatbot.domain.User;
import com.example.chatbot.dto.UserDto;
import com.example.chatbot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 비밀번호 정책 정규식: 최소 8자, 영문과 숫자는 최소 하나씩 포함 (특수문자 허용)
    private static final String PASSWORD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$";

    @Transactional
    public Long signup(UserDto.SignupRequest dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.findByNickname(dto.getNickname()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // --- 비밀번호 유효성 검사 로직 추가 ---
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

    @Transactional
    public void updateProfile(String email, UserDto.UpdateProfileRequest dto) {
        User user = findByEmail(email);

        // 닉네임 변경 처리
        if (dto.getNickname() != null && !dto.getNickname().isBlank() && !dto.getNickname().equals(user.getNickname())) {
            // 변경하려는 닉네임이 이미 존재하는지 확인 (본인 닉네임 제외)
            userRepository.findByNickname(dto.getNickname()).ifPresent(existedUser -> {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            });
            user.setNickname(dto.getNickname());
        }

        // 비밀번호 변경 처리
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

        // 현재 비밀번호가 일치하는지 확인
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

    // 이메일로 User 엔티티를 찾는 public 메서드 추가
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자를 찾을 수 없습니다: " + email));
    }
}

