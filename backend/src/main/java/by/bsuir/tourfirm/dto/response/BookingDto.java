package by.bsuir.tourfirm.dto.response;

import by.bsuir.tourfirm.entity.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Представление заявки на бронирование (с вложенными объектами тура и клиента). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {

    private Long id;
    private UserDto user;
    private TourDto tour;
    private LocalDate startDate;
    private int persons;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private PromoCodeDto promoCode;
    private LocalDateTime createdAt;
}
