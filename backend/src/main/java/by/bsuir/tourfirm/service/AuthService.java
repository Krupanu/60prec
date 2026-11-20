package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.LoginRequest;
import by.bsuir.tourfirm.dto.request.RegisterRequest;
import by.bsuir.tourfirm.dto.response.AuthResponse;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.UnauthorizedException;
import by.bsuir.tourfirm.mapper.UserMapper;
import by.bsuir.tourfirm.repository.UserRepository;
import by.bsuir.tourfirm.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Регистрация, вход и получение данных текущего пользователя. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final CurrentUserService currentUserService;

    /** Регистрация нового клиента; email должен быть уникален. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Пользователь с таким email уже зарегистрирован");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(Role.CLIENT)
                .build();
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    /** Вход: проверка учётных данных и выдача JWT. */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Неверный email или пароль");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Неверный email или пароль"));
        return buildAuthResponse(user);
    }

    public UserDto me() {
        return userMapper.toDto(currentUserService.getCurrentUser());
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .user(userMapper.toDto(user))
                .build();
    }
}
