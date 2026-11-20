package by.bsuir.tourfirm.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import java.nio.charset.StandardCharsets;

/**
 * Конфигурация Spring Security: stateless JWT-аутентификация,
 * ролевой доступ к эндпоинтам согласно контракту API.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Публичные эндпоинты
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tours/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                        // Отзывы: добавление — только клиент (правило раньше общего POST /tours/**)
                        .requestMatchers(HttpMethod.POST, "/api/v1/tours/*/reviews").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/**").authenticated()

                        // Туры: управление каталогом — менеджер
                        .requestMatchers(HttpMethod.POST, "/api/v1/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/tours/**").hasRole("MANAGER")

                        // Пользователи и промокоды — менеджер;
                        // проверка промокода при оформлении заявки — любой аутентифицированный пользователь
                        .requestMatchers("/api/v1/users/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/promocodes/validate").authenticated()
                        .requestMatchers("/api/v1/promocodes/**").hasRole("MANAGER")

                        // Транспорт: свои ТС — владелец, остальное — менеджер
                        .requestMatchers(HttpMethod.GET, "/api/v1/transports/my").hasRole("VEHICLE_OWNER")
                        .requestMatchers("/api/v1/transports/**").hasRole("MANAGER")

                        // Бронирования
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/my").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/status").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/pay").hasRole("CLIENT")
                        .requestMatchers("/api/v1/bookings/**").authenticated()

                        // Избранное — клиент
                        .requestMatchers("/api/v1/favorites/**").hasRole("CLIENT")

                        // Рейсы и документы
                        .requestMatchers(HttpMethod.GET, "/api/v1/trips/my").hasRole("VEHICLE_OWNER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/trips/*/documents").hasRole("VEHICLE_OWNER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/trips/*/documents").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/trips/*/status").hasRole("VEHICLE_OWNER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/trips/*/cancel").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/trips").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/trips/**").hasRole("MANAGER")
                        .requestMatchers("/api/v1/documents/**").authenticated()

                        // Профиль — любой аутентифицированный пользователь
                        .requestMatchers("/api/v1/profile/**").authenticated()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                                        "Требуется аутентификация", request.getRequestURI()))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                writeError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                                        "Доступ запрещён", request.getRequestURI()))
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Ответ об ошибке безопасности в едином формате ErrorResponse. */
    private void writeError(HttpServletResponse response, int status, String error,
                            String message, String path) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String body = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                java.time.LocalDateTime.now(), status, error, message, path);
        response.getWriter().write(body);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
