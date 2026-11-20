package by.bsuir.tourfirm.dto.request;

import by.bsuir.tourfirm.entity.enums.TripStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Запрос на смену статуса рейса (VEHICLE_OWNER). */
@Data
public class TripStatusRequest {

    @NotNull(message = "Статус обязателен")
    private TripStatus status;
}
