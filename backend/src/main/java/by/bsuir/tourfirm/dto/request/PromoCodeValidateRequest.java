package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Запрос на проверку промокода перед бронированием. */
@Data
public class PromoCodeValidateRequest {

    @NotBlank(message = "Код обязателен")
    private String code;

    @NotNull(message = "Не указан тур")
    private Long tourId;
}
