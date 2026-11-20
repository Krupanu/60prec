package by.bsuir.tourfirm.dto.request;

import by.bsuir.tourfirm.entity.enums.TransportType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Запрос на создание/обновление транспортного средства (MANAGER). */
@Data
public class TransportRequest {

    @NotBlank(message = "Модель обязательна")
    @Size(max = 150, message = "Модель не должна превышать 150 символов")
    private String model;

    @NotBlank(message = "Госномер обязателен")
    @Size(max = 20, message = "Госномер не должен превышать 20 символов")
    private String plateNumber;

    @NotNull(message = "Тип транспорта обязателен")
    private TransportType type;

    @Min(value = 1, message = "Количество мест — минимум 1")
    private int seats;

    @NotNull(message = "Не указан владелец транспорта")
    private Long ownerId;
}
