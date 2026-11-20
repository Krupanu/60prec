package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.TripRequest;
import by.bsuir.tourfirm.dto.request.TripStatusRequest;
import by.bsuir.tourfirm.dto.response.TripDto;
import by.bsuir.tourfirm.entity.enums.TripStatus;
import by.bsuir.tourfirm.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Рейсы: назначение менеджером, ведение владельцем транспорта. */
@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripDto> create(@Valid @RequestBody TripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.create(request));
    }

    @GetMapping
    public Page<TripDto> getAll(@RequestParam(required = false) TripStatus status,
                                @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return tripService.getAll(status, pageable);
    }

    @GetMapping("/my")
    public List<TripDto> getMy() {
        return tripService.getMy();
    }

    @PatchMapping("/{id}/status")
    public TripDto updateStatus(@PathVariable Long id, @Valid @RequestBody TripStatusRequest request) {
        return tripService.updateStatus(id, request.getStatus());
    }

    @PatchMapping("/{id}/cancel")
    public TripDto cancel(@PathVariable Long id) {
        return tripService.cancel(id);
    }
}
