package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.PromoCodeRequest;
import by.bsuir.tourfirm.dto.request.PromoCodeValidateRequest;
import by.bsuir.tourfirm.dto.response.PromoCodeDto;
import by.bsuir.tourfirm.dto.response.PromoCodeValidateResponse;
import by.bsuir.tourfirm.entity.PromoCode;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.PromoCodeMapper;
import by.bsuir.tourfirm.repository.PromoCodeRepository;
import by.bsuir.tourfirm.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/** Управление промокодами и их проверка при бронировании. */
@Service
@RequiredArgsConstructor
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;
    private final TourRepository tourRepository;
    private final PromoCodeMapper promoCodeMapper;

    @Transactional(readOnly = true)
    public Page<PromoCodeDto> getAll(Pageable pageable) {
        return promoCodeRepository.findAll(pageable).map(promoCodeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public PromoCodeDto getById(Long id) {
        return promoCodeMapper.toDto(findPromoCode(id));
    }

    @Transactional
    public PromoCodeDto create(PromoCodeRequest request) {
        validateDates(request.getValidFrom(), request.getValidTo());
        if (promoCodeRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ConflictException("Промокод с таким кодом уже существует");
        }
        PromoCode promoCode = PromoCode.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountPercent(request.getDiscountPercent())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .maxUses(request.getMaxUses())
                .active(request.getActive() == null || request.getActive())
                .build();
        return promoCodeMapper.toDto(promoCodeRepository.save(promoCode));
    }

    @Transactional
    public PromoCodeDto update(Long id, PromoCodeRequest request) {
        validateDates(request.getValidFrom(), request.getValidTo());
        PromoCode promoCode = findPromoCode(id);
        if (!promoCode.getCode().equalsIgnoreCase(request.getCode())
                && promoCodeRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ConflictException("Промокод с таким кодом уже существует");
        }
        promoCode.setCode(request.getCode().trim().toUpperCase());
        promoCode.setDiscountPercent(request.getDiscountPercent());
        promoCode.setValidFrom(request.getValidFrom());
        promoCode.setValidTo(request.getValidTo());
        promoCode.setMaxUses(request.getMaxUses());
        if (request.getActive() != null) {
            promoCode.setActive(request.getActive());
        }
        return promoCodeMapper.toDto(promoCodeRepository.save(promoCode));
    }

    @Transactional
    public void delete(Long id) {
        promoCodeRepository.delete(findPromoCode(id));
    }

    /** Мягкая проверка промокода: результат в теле ответа, без исключений. */
    @Transactional(readOnly = true)
    public PromoCodeValidateResponse validate(PromoCodeValidateRequest request) {
        if (!tourRepository.existsById(request.getTourId())) {
            return PromoCodeValidateResponse.builder()
                    .valid(false).message("Тур не найден").build();
        }
        try {
            PromoCode promoCode = getApplicablePromoCode(request.getCode());
            return PromoCodeValidateResponse.builder()
                    .valid(true)
                    .discountPercent(promoCode.getDiscountPercent())
                    .message("Промокод применён: скидка " + promoCode.getDiscountPercent() + "%")
                    .build();
        } catch (BadRequestException | ConflictException e) {
            return PromoCodeValidateResponse.builder()
                    .valid(false).message(e.getMessage()).build();
        }
    }

    /**
     * Строгая проверка промокода для бронирования.
     * Возвращает промокод, пригодный к применению, либо выбрасывает исключение.
     */
    public PromoCode getApplicablePromoCode(String code) {
        PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("Промокод не найден"));
        if (!promoCode.isActive()) {
            throw new BadRequestException("Промокод неактивен");
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(promoCode.getValidFrom()) || today.isAfter(promoCode.getValidTo())) {
            throw new BadRequestException("Срок действия промокода истёк или ещё не наступил");
        }
        if (promoCode.getUsedCount() >= promoCode.getMaxUses()) {
            throw new ConflictException("Лимит использований промокода исчерпан");
        }
        return promoCode;
    }

    public PromoCode findPromoCode(Long id) {
        return promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Промокод не найден: id=" + id));
    }

    private void validateDates(LocalDate validFrom, LocalDate validTo) {
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new BadRequestException("Дата окончания действия раньше даты начала");
        }
    }
}
