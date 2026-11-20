package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.BookingRequest;
import by.bsuir.tourfirm.dto.request.BookingStatusRequest;
import by.bsuir.tourfirm.dto.response.BookingDto;
import by.bsuir.tourfirm.entity.enums.BookingStatus;
import by.bsuir.tourfirm.service.BookingService;
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

/** Бронирование туров. */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @GetMapping("/my")
    public List<BookingDto> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/{id}")
    public BookingDto getById(@PathVariable Long id) {
        return bookingService.getById(id);
    }

    @PostMapping("/{id}/cancel")
    public BookingDto cancel(@PathVariable Long id) {
        return bookingService.cancel(id);
    }

    @PostMapping("/{id}/pay")
    public BookingDto pay(@PathVariable Long id) {
        return bookingService.pay(id);
    }

    /** Список всех заявок (MANAGER) с фильтром по статусу. */
    @GetMapping
    public Page<BookingDto> getAll(@RequestParam(required = false) BookingStatus status,
                                   @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return bookingService.getAll(status, pageable);
    }

    @PatchMapping("/{id}/status")
    public BookingDto updateStatus(@PathVariable Long id, @Valid @RequestBody BookingStatusRequest request) {
        return bookingService.updateStatus(id, request.getStatus());
    }
}
