package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Запрос на назначение транспорта на рейс (MANAGER). */
@Data
public class TripRequest {

    @NotNull(message = "Не указан тур")
    private Long tourId;

    @NotNull(message = "Не указан транспорт")
    private Long transportId;

    @NotNull(message = "Дата отправления обязательна")
    private LocalDate departureDate;
}
