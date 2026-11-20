package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.TourRequest;
import by.bsuir.tourfirm.dto.response.TourDto;
import by.bsuir.tourfirm.entity.enums.TourType;
import by.bsuir.tourfirm.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/** Каталог туров: публичный просмотр, управление — MANAGER. */
@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public Page<TourDto> getTours(@RequestParam(required = false) String search,
                                  @RequestParam(required = false) String country,
                                  @RequestParam(required = false) TourType type,
                                  @RequestParam(required = false) BigDecimal minPrice,
                                  @RequestParam(required = false) BigDecimal maxPrice,
                                  @ParameterObject @PageableDefault(size = 12) Pageable pageable) {
        return tourService.search(search, country, type, minPrice, maxPrice, pageable);
    }

    @GetMapping("/{id}")
    public TourDto getTour(@PathVariable Long id) {
        return tourService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TourDto> createTour(@Valid @RequestBody TourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tourService.create(request));
    }

    @PutMapping("/{id}")
    public TourDto updateTour(@PathVariable Long id, @Valid @RequestBody TourRequest request) {
        return tourService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
