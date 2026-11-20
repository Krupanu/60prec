package by.bsuir.tourfirm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Представление промокода. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoCodeDto {

    private Long id;
    private String code;
    private int discountPercent;
    private LocalDate validFrom;
    private LocalDate validTo;
    private int maxUses;
    private int usedCount;
    private boolean active;
}
