package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Trip;
import by.bsuir.tourfirm.entity.enums.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findAllByTransportOwnerId(Long ownerId);

    Page<Trip> findAllByStatus(TripStatus status, Pageable pageable);
}
