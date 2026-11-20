package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.TripDto;
import by.bsuir.tourfirm.entity.Trip;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TripMapper {

    private final TourMapper tourMapper;
    private final TransportMapper transportMapper;

    public TripDto toDto(Trip trip) {
        return TripDto.builder()
                .id(trip.getId())
                .tour(tourMapper.toDto(trip.getTour()))
                .transport(transportMapper.toDto(trip.getTransport()))
                .departureDate(trip.getDepartureDate())
                .status(trip.getStatus())
                .build();
    }
}
