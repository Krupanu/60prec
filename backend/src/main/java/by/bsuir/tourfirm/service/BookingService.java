package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.BookingRequest;
import by.bsuir.tourfirm.dto.response.BookingDto;
import by.bsuir.tourfirm.entity.Booking;
import by.bsuir.tourfirm.entity.PromoCode;
import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.BookingStatus;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ForbiddenException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.BookingMapper;
import by.bsuir.tourfirm.repository.BookingRepository;
import by.bsuir.tourfirm.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Бронирование туров: расчёт итоговой стоимости на сервере,
 * применение промокодов, оплата и отмена заявок.
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final TourService tourService;
    private final PromoCodeService promoCodeService;
    private final CurrentUserService currentUserService;
    private final BookingMapper bookingMapper;

    /**
     * Создание заявки. Итоговая цена = price * persons,
     * при валидном промокоде применяется скидка и usedCount увеличивается.
     */
    @Transactional
    public BookingDto create(BookingRequest request) {
        User client = currentUserService.getCurrentUser();
        Tour tour = tourService.findTour(request.getTourId());
        if (!tour.isActive()) {
            throw new BadRequestException("Тур недоступен для бронирования");
        }
        if (request.getPersons() > tour.getMaxPersons()) {
            throw new BadRequestException("Превышено максимальное количество туристов для тура ("
                    + tour.getMaxPersons() + ")");
        }

        BigDecimal totalPrice = tour.getPrice()
                .multiply(BigDecimal.valueOf(request.getPersons()))
                .setScale(2, RoundingMode.HALF_UP);

        PromoCode promoCode = null;
        if (StringUtils.hasText(request.getPromoCode())) {
            promoCode = promoCodeService.getApplicablePromoCode(request.getPromoCode());
            totalPrice = applyDiscount(totalPrice, promoCode.getDiscountPercent());
            promoCode.setUsedCount(promoCode.getUsedCount() + 1);
            promoCodeRepository.save(promoCode);
        }

        Booking booking = Booking.builder()
                .user(client)
                .tour(tour)
                .startDate(request.getStartDate())
                .persons(request.getPersons())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .promoCode(promoCode)
                .build();
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User client = currentUserService.getCurrentUser();
        return bookingRepository.findAllByUserIdOrderByCreatedAtDesc(client.getId()).stream()
                .map(bookingMapper::toDto)
                .toList();
    }

    /** Просмотр заявки: владелец или менеджер. */
    @Transactional(readOnly = true)
    public BookingDto getById(Long id) {
        Booking booking = findBooking(id);
        User current = currentUserService.getCurrentUser();
        checkOwnerOrManager(booking, current);
        return bookingMapper.toDto(booking);
    }

    /** Список всех заявок для менеджера с фильтром по статусу. */
    @Transactional(readOnly = true)
    public Page<BookingDto> getAll(BookingStatus status, Pageable pageable) {
        Page<Booking> page = status != null
                ? bookingRepository.findAllByStatus(status, pageable)
                : bookingRepository.findAll(pageable);
        return page.map(bookingMapper::toDto);
    }

    /** Имитация оплаты: перевод PENDING/CONFIRMED в PAID, только владелец. */
    @Transactional
    public BookingDto pay(Long id) {
        Booking booking = findBooking(id);
        User current = currentUserService.getCurrentUser();
        if (!booking.getUser().getId().equals(current.getId())) {
            throw new ForbiddenException("Оплатить можно только свою заявку");
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ConflictException("Оплата возможна только для заявок в статусе PENDING или CONFIRMED");
        }
        booking.setStatus(BookingStatus.PAID);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    /** Отмена заявки владельцем или менеджером. */
    @Transactional
    public BookingDto cancel(Long id) {
        Booking booking = findBooking(id);
        User current = currentUserService.getCurrentUser();
        checkOwnerOrManager(booking, current);
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ConflictException("Заявка уже отменена или завершена");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    /** Смена статуса заявки менеджером. */
    @Transactional
    public BookingDto updateStatus(Long id, BookingStatus status) {
        Booking booking = findBooking(id);
        booking.setStatus(status);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    public Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Заявка не найдена: id=" + id));
    }

    /** Скидка в процентах от итоговой стоимости. */
    private BigDecimal applyDiscount(BigDecimal totalPrice, int discountPercent) {
        BigDecimal multiplier = BigDecimal.valueOf(100L - discountPercent)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return totalPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    private void checkOwnerOrManager(Booking booking, User current) {
        boolean isOwner = booking.getUser().getId().equals(current.getId());
        if (!isOwner && current.getRole() != Role.MANAGER) {
            throw new ForbiddenException("Доступ к чужой заявке запрещён");
        }
    }
}
