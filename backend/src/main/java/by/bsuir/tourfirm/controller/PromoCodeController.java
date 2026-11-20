package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.PromoCodeRequest;
import by.bsuir.tourfirm.dto.request.PromoCodeValidateRequest;
import by.bsuir.tourfirm.dto.response.PromoCodeDto;
import by.bsuir.tourfirm.dto.response.PromoCodeValidateResponse;
import by.bsuir.tourfirm.service.PromoCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Управление промокодами (MANAGER) и их проверка. */
@RestController
@RequestMapping("/api/v1/promocodes")
@RequiredArgsConstructor
public class PromoCodeController {

    private final PromoCodeService promoCodeService;

    @GetMapping
    public Page<PromoCodeDto> getAll(@ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return promoCodeService.getAll(pageable);
    }

    @GetMapping("/{id}")
    public PromoCodeDto getById(@PathVariable Long id) {
        return promoCodeService.getById(id);
    }

    @PostMapping
    public ResponseEntity<PromoCodeDto> create(@Valid @RequestBody PromoCodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promoCodeService.create(request));
    }

    @PutMapping("/{id}")
    public PromoCodeDto update(@PathVariable Long id, @Valid @RequestBody PromoCodeRequest request) {
        return promoCodeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promoCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public PromoCodeValidateResponse validate(@Valid @RequestBody PromoCodeValidateRequest request) {
        return promoCodeService.validate(request);
    }
}
