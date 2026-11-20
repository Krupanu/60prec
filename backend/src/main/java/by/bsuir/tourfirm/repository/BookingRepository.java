package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Booking;
import by.bsuir.tourfirm.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Booking> findAllByStatus(BookingStatus status, Pageable pageable);
}
