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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // CUD 작업이 아닌 경우 readOnly = true 설정
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
}