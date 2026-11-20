package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.response.TourDto;
import by.bsuir.tourfirm.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Избранные туры клиента. */
@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public List<TourDto> getMyFavorites() {
        return favoriteService.getMyFavorites();
    }

    @PostMapping("/{tourId}")
    public ResponseEntity<TourDto> add(@PathVariable Long tourId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(favoriteService.add(tourId));
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<Void> remove(@PathVariable Long tourId) {
        favoriteService.remove(tourId);
        return ResponseEntity.noContent().build();
    }
}

im righing smth in order to make mom think 