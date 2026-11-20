package by.bsuir.tourfirm.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/** Запрос на добавление отзыва о туре (CLIENT). */
@Data
public class ReviewRequest {

    @Min(value = 1, message = "Оценка не может быть меньше 1")
    @Max(value = 5, message = "Оценка не может быть больше 5")
    private int rating;

    private String comment;
}
