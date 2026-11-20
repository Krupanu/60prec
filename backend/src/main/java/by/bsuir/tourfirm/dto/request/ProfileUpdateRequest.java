package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Запрос на обновление профиля текущего пользователя. */
@Data
public class ProfileUpdateRequest {

    @NotBlank(message = "Имя обязательно")
    @Size(max = 100, message = "Имя не должно превышать 100 символов")
    private String firstName;

    @NotBlank(message = "Фамилия обязательна")
    @Size(max = 100, message = "Фамилия не должна превышать 100 символов")
    private String lastName;

    @Size(max = 32, message = "Телефон не должен превышать 32 символа")
    private String phone;
}
