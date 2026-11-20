package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByTourIdOrderByCreatedAtDesc(Long tourId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);

    long countByTourId(Long tourId);

    /** Средняя оценка тура; null, если отзывов нет. */
    @Query("select avg(r.rating) from Review r where r.tour.id = :tourId")
    Double findAverageRatingByTourId(@Param("tourId") Long tourId);
}
