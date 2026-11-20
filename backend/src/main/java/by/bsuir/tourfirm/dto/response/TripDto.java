package by.bsuir.tourfirm.dto.response;

import by.bsuir.tourfirm.entity.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Представление рейса (с вложенными туром и транспортом). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripDto {

    private Long id;
    private TourDto tour;
    private TransportDto transport;
    private LocalDate departureDate;
    private TripStatus status;
}
