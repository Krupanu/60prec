import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';
import { formatPrice } from './PriceWithDiscount';
import type { Tour } from '../types';

export const TOUR_TYPE_LABELS: Record<Tour['type'], string> = {
  BEACH: 'Пляжный',
  EXCURSION: 'Экскурсионный',
  SKI: 'Горнолыжный',
  CRUISE: 'Круиз',
  ADVENTURE: 'Приключения',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60';

interface Props {
  tour: Tour;
}

export default function TourCard({ tour }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={tour.imageUrl || FALLBACK_IMAGE}
        alt={tour.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip label={TOUR_TYPE_LABELS[tour.type]} size="small" color="primary" variant="outlined" />
          <RatingStars value={tour.avgRating} readOnly />
        </Box>
        <Typography variant="h6" gutterBottom noWrap>
          {tour.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOnIcon fontSize="small" /> {tour.country}, {tour.city}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <CalendarMonthIcon fontSize="small" /> {tour.durationDays} дн. · до {tour.maxPersons} чел.
        </Typography>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          от {formatPrice(tour.price)}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/tours/${tour.id}`)}
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
}
