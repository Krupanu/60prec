package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.ReviewRequest;
import by.bsuir.tourfirm.dto.response.ReviewDto;
import by.bsuir.tourfirm.entity.Review;
import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ForbiddenException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.ReviewMapper;
import by.bsuir.tourfirm.repository.ReviewRepository;
import by.bsuir.tourfirm.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Отзывы о турах; при добавлении/удалении пересчитывается средний рейтинг тура. */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TourRepository tourRepository;
    private final TourService tourService;
    private final CurrentUserService currentUserService;
    private final ReviewMapper reviewMapper;

    @Transactional(readOnly = true)
    public List<ReviewDto> getByTour(Long tourId) {
        tourService.findTour(tourId);
        return reviewRepository.findAllByTourIdOrderByCreatedAtDesc(tourId).stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    /** Один пользователь может оставить только один отзыв на тур. */
    @Transactional
    public ReviewDto create(Long tourId, ReviewRequest request) {
        Tour tour = tourService.findTour(tourId);
        User author = currentUserService.getCurrentUser();
        if (reviewRepository.existsByUserIdAndTourId(author.getId(), tourId)) {
            throw new ConflictException("Вы уже оставили отзыв на этот тур");
        }
        Review review = Review.builder()
                .user(author)
                .tour(tour)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        Review saved = reviewRepository.save(review);
        recalculateAvgRating(tour);
        return reviewMapper.toDto(saved);
    }

    /** Удаление отзыва автором или менеджером. */
    @Transactional
    public void delete(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Отзыв не найден: id=" + id));
        User current = currentUserService.getCurrentUser();
        boolean isAuthor = review.getUser().getId().equals(current.getId());
        if (!isAuthor && current.getRole() != Role.MANAGER) {
            throw new ForbiddenException("Удалить отзыв может только его автор или менеджер");
        }
        Tour tour = review.getTour();
        reviewRepository.delete(review);
        recalculateAvgRating(tour);
    }

    /** Пересчёт среднего рейтинга тура по всем отзывам. */
    private void recalculateAvgRating(Tour tour) {
        Double avg = reviewRepository.findAverageRatingByTourId(tour.getId());
        tour.setAvgRating(avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0);
        tourRepository.save(tour);
    }
}
