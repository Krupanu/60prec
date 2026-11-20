package by.bsuir.tourfirm.dto.response;

import by.bsuir.tourfirm.entity.enums.TourType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Представление тура в каталоге. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourDto {

    private Long id;
    private String title;
    private String description;
    private String country;
    private String city;
    private TourType type;
    private BigDecimal price;
    private int durationDays;
    private int maxPersons;
    private String imageUrl;
    private boolean active;
    private double avgRating;
    private long reviewsCount;
    private LocalDateTime createdAt;
}
