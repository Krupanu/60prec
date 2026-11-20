package by.bsuir.tourfirm.dto.response;

import by.bsuir.tourfirm.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Публичное представление пользователя (без хеша пароля). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Role role;
    private boolean blocked;
    private LocalDateTime createdAt;
}
