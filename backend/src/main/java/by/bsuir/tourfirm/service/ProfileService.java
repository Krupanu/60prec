package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.PasswordChangeRequest;
import by.bsuir.tourfirm.dto.request.ProfileUpdateRequest;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.mapper.UserMapper;
import by.bsuir.tourfirm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Профиль текущего пользователя: просмотр, редактирование, смена пароля. */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserDto getProfile() {
        return userMapper.toDto(currentUserService.getCurrentUser());
    }

    @Transactional
    public UserDto updateProfile(ProfileUpdateRequest request) {
        User user = currentUserService.getCurrentUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        return userMapper.toDto(userRepository.save(user));
    }

    /** Смена пароля: требуется подтверждение текущим паролем. */
    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        User user = currentUserService.getCurrentUser();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Неверный текущий пароль");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
