package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findAllByTripId(Long tripId);
}
