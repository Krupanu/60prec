package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Запрос на смену пароля текущего пользователя. */
@Data
public class PasswordChangeRequest {

    @NotBlank(message = "Текущий пароль обязателен")
    private String oldPassword;

    @NotBlank(message = "Новый пароль обязателен")
    @Size(min = 6, max = 64, message = "Пароль должен содержать от 6 до 64 символов")
    private String newPassword;
}
