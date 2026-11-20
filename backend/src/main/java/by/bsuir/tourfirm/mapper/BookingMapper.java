package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.BookingDto;
import by.bsuir.tourfirm.entity.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    private final UserMapper userMapper;
    private final TourMapper tourMapper;
    private final PromoCodeMapper promoCodeMapper;

    /** Вызывать внутри транзакции: обращается к ленивым связям. */
    public BookingDto toDto(Booking booking) {
        return BookingDto.builder()
                .id(booking.getId())
                .user(userMapper.toDto(booking.getUser()))
                .tour(tourMapper.toDto(booking.getTour()))
                .startDate(booking.getStartDate())
                .persons(booking.getPersons())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .promoCode(booking.getPromoCode() != null ? promoCodeMapper.toDto(booking.getPromoCode()) : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
