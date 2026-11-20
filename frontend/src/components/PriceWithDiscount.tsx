import { Box, Typography } from '@mui/material';
import { ACCENT } from '../theme';

interface Props {
  price: number;
  discountPercent?: number;
  size?: 'normal' | 'large';
}

export function formatPrice(value: number): string {
  return (
    value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) +
    ' BYN'
  );
}

// Цена со скидкой по промокоду: старая цена зачёркнута, новая — акцентом
export default function PriceWithDiscount({ price, discountPercent = 0, size = 'normal' }: Props) {
  const hasDiscount = discountPercent > 0;
  const finalPrice = hasDiscount ? price * (1 - discountPercent / 100) : price;
  const variant = size === 'large' ? 'h4' : 'h6';

  return (
    <Box>
      {hasDiscount && (
        <Typography
          variant="body2"
          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
        >
          {formatPrice(price)}
        </Typography>
      )}
      <Typography
        variant={variant}
        sx={{ color: hasDiscount ? '#8a6d1f' : 'text.primary', fontWeight: 700 }}
      >
        {formatPrice(finalPrice)}
      </Typography>
      {hasDiscount && (
        <Typography variant="caption" sx={{ color: ACCENT, fontWeight: 700 }}>
          Скидка {discountPercent}% по промокоду
        </Typography>
      )}
    </Box>
  );
}
