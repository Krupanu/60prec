package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .blocked(user.isBlocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
