package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/** Запрос на бронирование тура (CLIENT). */
@Data
public class BookingRequest {

    @NotNull(message = "Не указан тур")
    private Long tourId;

    @NotNull(message = "Дата начала обязательна")
    @FutureOrPresent(message = "Дата начала не может быть в прошлом")
    private LocalDate startDate;

    @Min(value = 1, message = "Количество туристов — минимум 1")
    private int persons;

    /** Необязательный промокод на скидку. */
    private String promoCode;
}
