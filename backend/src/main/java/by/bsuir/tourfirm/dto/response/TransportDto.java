package by.bsuir.tourfirm.dto.response;

import by.bsuir.tourfirm.entity.enums.TransportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Представление транспортного средства (с вложенным владельцем). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransportDto {

    private Long id;
    private String model;
    private String plateNumber;
    private TransportType type;
    private int seats;
    private UserDto owner;
}
