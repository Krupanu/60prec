package by.bsuir.tourfirm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Промокод на скидку при бронировании. */
@Entity
@Table(name = "promo_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    /** Процент скидки, от 1 до 90. */
    @Column(name = "discount_percent", nullable = false)
    private int discountPercent;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;

    @Column(name = "max_uses", nullable = false)
    private int maxUses;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private int usedCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
