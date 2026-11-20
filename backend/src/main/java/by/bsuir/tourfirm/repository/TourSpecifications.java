package by.bsuir.tourfirm.repository;

import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.enums.TourType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Спецификации для фильтрации каталога туров. */
public final class TourSpecifications {

    private TourSpecifications() {
    }

    /**
     * Фильтр каталога: поиск по названию/стране/городу, страна, тип,
     * диапазон цен. В публичный каталог попадают только активные туры.
     */
    public static Specification<Tour> byFilter(String search, String country, TourType type,
                                               BigDecimal minPrice, BigDecimal maxPrice,
                                               boolean onlyActive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (onlyActive) {
                predicates.add(cb.isTrue(root.get("active")));
            }
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern),
                        cb.like(cb.lower(root.get("city")), pattern)
                ));
            }
            if (StringUtils.hasText(country)) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.trim().toLowerCase()));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
