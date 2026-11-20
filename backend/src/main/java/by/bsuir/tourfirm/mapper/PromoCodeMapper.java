package by.bsuir.tourfirm.mapper;

import by.bsuir.tourfirm.dto.response.PromoCodeDto;
import by.bsuir.tourfirm.entity.PromoCode;
import org.springframework.stereotype.Component;

@Component
public class PromoCodeMapper {

    public PromoCodeDto toDto(PromoCode promoCode) {
        return PromoCodeDto.builder()
                .id(promoCode.getId())
                .code(promoCode.getCode())
                .discountPercent(promoCode.getDiscountPercent())
                .validFrom(promoCode.getValidFrom())
                .validTo(promoCode.getValidTo())
                .maxUses(promoCode.getMaxUses())
                .usedCount(promoCode.getUsedCount())
                .active(promoCode.isActive())
                .build();
    }
}
