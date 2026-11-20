package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.ReviewDto;
import by.bsuir.tourfirm.entity.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewMapper {

    private final UserMapper userMapper;
    private final TourMapper tourMapper;

    public ReviewDto toDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .user(userMapper.toDto(review.getUser()))
                .tour(tourMapper.toDto(review.getTour()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
