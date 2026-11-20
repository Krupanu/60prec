package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.TourRequest;
import by.bsuir.tourfirm.dto.response.TourDto;
import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.enums.TourType;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.TourMapper;
import by.bsuir.tourfirm.repository.ReviewRepository;
import by.bsuir.tourfirm.repository.TourRepository;
import by.bsuir.tourfirm.repository.TourSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/** Каталог туров: публичный поиск с фильтрами и управление (MANAGER). */
@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final ReviewRepository reviewRepository;
    private final TourMapper tourMapper;

    /** Публичный каталог: только активные туры, фильтры и пагинация. */
    @Transactional(readOnly = true)
    public Page<TourDto> search(String search, String country, TourType type,
                                BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Specification<Tour> spec = TourSpecifications.byFilter(search, country, type, minPrice, maxPrice, true);
        return tourRepository.findAll(spec, pageable)
                .map(tour -> tourMapper.toDto(tour, reviewRepository.countByTourId(tour.getId())));
    }

    @Transactional(readOnly = true)
    public TourDto getById(Long id) {
        Tour tour = findTour(id);
        return tourMapper.toDto(tour, reviewRepository.countByTourId(tour.getId()));
    }

    @Transactional
    public TourDto create(TourRequest request) {
        Tour tour = Tour.builder().build();
        applyRequest(tour, request);
        return tourMapper.toDto(tourRepository.save(tour));
    }

    @Transactional
    public TourDto update(Long id, TourRequest request) {
        Tour tour = findTour(id);
        applyRequest(tour, request);
        return tourMapper.toDto(tourRepository.save(tour), reviewRepository.countByTourId(id));
    }

    /** Мягкое удаление: тур скрывается из каталога, заявки сохраняются. */
    @Transactional
    public void delete(Long id) {
        Tour tour = findTour(id);
        tour.setActive(false);
        tourRepository.save(tour);
    }

    public Tour findTour(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тур не найден: id=" + id));
    }

    private void applyRequest(Tour tour, TourRequest request) {
        tour.setTitle(request.getTitle());
        tour.setDescription(request.getDescription());
        tour.setCountry(request.getCountry());
        tour.setCity(request.getCity());
        tour.setType(request.getType());
        tour.setPrice(request.getPrice());
        tour.setDurationDays(request.getDurationDays());
        tour.setMaxPersons(request.getMaxPersons());
        tour.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            tour.setActive(request.getActive());
        }
    }
}
