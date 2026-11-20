package by.bsuir.tourfirm.dto.request;

import by.bsuir.tourfirm.entity.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Запрос на смену статуса заявки (MANAGER). */
@Data
public class BookingStatusRequest {

    @NotNull(message = "Статус обязателен")
    private BookingStatus status;
}
