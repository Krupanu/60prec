package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.TransportRequest;
import by.bsuir.tourfirm.dto.response.TransportDto;
import by.bsuir.tourfirm.service.TransportService;
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

/** Управление транспортными средствами. */
@RestController
@RequestMapping("/api/v1/transports")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    @GetMapping
    public Page<TransportDto> getAll(@ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return transportService.getAll(pageable);
    }

    @GetMapping("/my")
    public List<TransportDto> getMy() {
        return transportService.getMy();
    }

    @GetMapping("/{id}")
    public TransportDto getById(@PathVariable Long id) {
        return transportService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TransportDto> create(@Valid @RequestBody TransportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transportService.create(request));
    }

    @PutMapping("/{id}")
    public TransportDto update(@PathVariable Long id, @Valid @RequestBody TransportRequest request) {
        return transportService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
