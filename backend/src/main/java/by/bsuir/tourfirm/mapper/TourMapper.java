package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.TourDto;
import by.bsuir.tourfirm.entity.Tour;
import org.springframework.stereotype.Component;

@Component
public class TourMapper {

    public TourDto toDto(Tour tour, long reviewsCount) {
        return TourDto.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .country(tour.getCountry())
                .city(tour.getCity())
                .type(tour.getType())
                .price(tour.getPrice())
                .durationDays(tour.getDurationDays())
                .maxPersons(tour.getMaxPersons())
                .imageUrl(tour.getImageUrl())
                .active(tour.isActive())
                .avgRating(tour.getAvgRating())
                .reviewsCount(reviewsCount)
                .createdAt(tour.getCreatedAt())
                .build();
    }

    public TourDto toDto(Tour tour) {
        return toDto(tour, 0);
    }
}
