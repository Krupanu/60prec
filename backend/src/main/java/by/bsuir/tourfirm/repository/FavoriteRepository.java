package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findAllByUserId(Long userId);

    Optional<Favorite> findByUserIdAndTourId(Long userId, Long tourId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);
}
