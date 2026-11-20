package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.TransportDto;
import by.bsuir.tourfirm.entity.Transport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransportMapper {

    private final UserMapper userMapper;

    public TransportDto toDto(Transport transport) {
        return TransportDto.builder()
                .id(transport.getId())
                .model(transport.getModel())
                .plateNumber(transport.getPlateNumber())
                .type(transport.getType())
                .seats(transport.getSeats())
                .owner(userMapper.toDto(transport.getOwner()))
                .build();
    }
}
