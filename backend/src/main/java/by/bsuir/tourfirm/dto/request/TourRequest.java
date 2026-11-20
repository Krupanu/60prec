package by.bsuir.tourfirm.dto.request;

import by.bsuir.tourfirm.entity.enums.TourType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/** Запрос на создание/обновление тура (MANAGER). */
@Data
public class TourRequest {

    @NotBlank(message = "Название тура обязательно")
    @Size(max = 255, message = "Название не должно превышать 255 символов")
    private String title;

    private String description;

    @NotBlank(message = "Страна обязательна")
    @Size(max = 100, message = "Название страны не должно превышать 100 символов")
    private String country;

    @Size(max = 100, message = "Название города не должно превышать 100 символов")
    private String city;

    @NotNull(message = "Тип тура обязателен")
    private TourType type;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.01", message = "Цена должна быть больше нуля")
    private BigDecimal price;

    @Min(value = 1, message = "Длительность тура — минимум 1 день")
    private int durationDays;

    @Min(value = 1, message = "Максимальное число туристов — минимум 1")
    private int maxPersons;

    @Size(max = 512, message = "Ссылка на изображение не должна превышать 512 символов")
    private String imageUrl;

    private Boolean active;
}
