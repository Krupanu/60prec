package by.bsuir.tourfirm.entity;

import by.bsuir.tourfirm.entity.enums.TourType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Тур из каталога тур-фирмы. */
@Entity
@Table(name = "tours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String country;

    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(name = "max_persons", nullable = false)
    private int maxPersons;

    @Column(name = "image_url")
    private String imageUrl;

    /** Мягкое удаление: неактивные туры скрыты из каталога. */
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    /** Средний рейтинг, пересчитывается при добавлении/удалении отзывов. */
    @Builder.Default
    @Column(name = "avg_rating", nullable = false)
    private double avgRating = 0.0;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
