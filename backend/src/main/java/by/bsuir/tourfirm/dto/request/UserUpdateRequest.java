package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Запрос на обновление пользователя (MANAGER). Все поля необязательны. */
@Data
public class UserUpdateRequest {

    @Email(message = "Некорректный формат email")
    private String email;

    @Size(max = 100, message = "Имя не должно превышать 100 символов")
    private String firstName;

    @Size(max = 100, message = "Фамилия не должна превышать 100 символов")
    private String lastName;

    @Size(max = 32, message = "Телефон не должен превышать 32 символа")
    private String phone;
}
