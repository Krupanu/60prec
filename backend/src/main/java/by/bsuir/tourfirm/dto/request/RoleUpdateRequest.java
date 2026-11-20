package by.bsuir.tourfirm.dto.request;

import by.bsuir.tourfirm.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Запрос на смену роли пользователя (MANAGER). */
@Data
public class RoleUpdateRequest {

    @NotNull(message = "Роль обязательна")
    private Role role;
}
