package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

/** Запрос на создание/обновление промокода (MANAGER). */
@Data
public class PromoCodeRequest {

    @NotBlank(message = "Код обязателен")
    @Size(max = 50, message = "Код не должен превышать 50 символов")
    private String code;

    @Min(value = 1, message = "Скидка не может быть меньше 1%")
    @Max(value = 90, message = "Скидка не может превышать 90%")
    private int discountPercent;

    @NotNull(message = "Дата начала действия обязательна")
    private LocalDate validFrom;

    @NotNull(message = "Дата окончания действия обязательна")
    private LocalDate validTo;

    @Min(value = 1, message = "Максимальное число использований — минимум 1")
    private int maxUses;

    private Boolean active;
}
