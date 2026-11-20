package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Запрос на блокировку/разблокировку пользователя (MANAGER). */
@Data
public class BlockUpdateRequest {

    @NotNull(message = "Признак блокировки обязателен")
    private Boolean blocked;
}
