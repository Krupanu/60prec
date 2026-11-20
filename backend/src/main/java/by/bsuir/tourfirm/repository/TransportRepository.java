package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Transport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransportRepository extends JpaRepository<Transport, Long> {

    List<Transport> findAllByOwnerId(Long ownerId);

    boolean existsByPlateNumber(String plateNumber);
}
