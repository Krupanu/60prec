package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.response.TourDto;
import by.bsuir.tourfirm.entity.Favorite;
import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.TourMapper;
import by.bsuir.tourfirm.repository.FavoriteRepository;
import by.bsuir.tourfirm.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Избранные туры клиента. Пара (пользователь, тур) уникальна. */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ReviewRepository reviewRepository;
    private final TourService tourService;
    private final CurrentUserService currentUserService;
    private final TourMapper tourMapper;

    @Transactional(readOnly = true)
    public List<TourDto> getMyFavorites() {
        User current = currentUserService.getCurrentUser();
        return favoriteRepository.findAllByUserId(current.getId()).stream()
                .map(favorite -> {
                    Tour tour = favorite.getTour();
                    return tourMapper.toDto(tour, reviewRepository.countByTourId(tour.getId()));
                })
                .toList();
    }

    /** Повторное добавление в избранное — конфликт (409). */
    @Transactional
    public TourDto add(Long tourId) {
        User current = currentUserService.getCurrentUser();
        Tour tour = tourService.findTour(tourId);
        if (favoriteRepository.existsByUserIdAndTourId(current.getId(), tourId)) {
            throw new ConflictException("Тур уже добавлен в избранное");
        }
        favoriteRepository.save(Favorite.builder().user(current).tour(tour).build());
        return tourMapper.toDto(tour, reviewRepository.countByTourId(tourId));
    }

    @Transactional
    public void remove(Long tourId) {
        User current = currentUserService.getCurrentUser();
        Favorite favorite = favoriteRepository.findByUserIdAndTourId(current.getId(), tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Тур отсутствует в избранном"));
        favoriteRepository.delete(favorite);
    }
}
