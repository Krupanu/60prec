package by.bsuir.tourfirm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Результат проверки промокода. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoCodeValidateResponse {

    private boolean valid;
    private Integer discountPercent;
    private String message;
}
