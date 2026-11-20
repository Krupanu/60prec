package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.LoginRequest;
import by.bsuir.tourfirm.dto.request.RegisterRequest;
import by.bsuir.tourfirm.dto.response.AuthResponse;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Аутентификация: регистрация, вход, данные текущего пользователя. */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDto me() {
        return authService.me();
    }
}
