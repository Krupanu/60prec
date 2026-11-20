package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.ReviewRequest;
import by.bsuir.tourfirm.dto.response.ReviewDto;
import by.bsuir.tourfirm.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Отзывы о турах. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/tours/{tourId}/reviews")
    public List<ReviewDto> getByTour(@PathVariable Long tourId) {
        return reviewService.getByTour(tourId);
    }

    @PostMapping("/tours/{tourId}/reviews")
    public ResponseEntity<ReviewDto> create(@PathVariable Long tourId, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(tourId, request));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
