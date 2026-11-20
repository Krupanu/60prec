import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { ACCENT } from '../theme';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 'small' | 'medium' | 'large';
  readOnly?: boolean;
}

export default function RatingStars({ value, onChange, size = 'small', readOnly }: Props) {
  return (
    <Rating
      value={value}
      precision={readOnly ? 0.5 : 1}
      size={size}
      readOnly={readOnly ?? !onChange}
      onChange={(_, v) => onChange?.(v ?? 0)}
      icon={<StarIcon fontSize="inherit" sx={{ color: ACCENT }} />}
      emptyIcon={<StarBorderIcon fontSize="inherit" sx={{ color: '#D9CBC2' }} />}
    />
  );
}
