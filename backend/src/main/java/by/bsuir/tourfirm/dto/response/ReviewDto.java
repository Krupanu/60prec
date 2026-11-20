package by.bsuir.tourfirm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Представление отзыва о туре (с вложенным автором). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    private Long id;
    private UserDto user;
    private TourDto tour;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
