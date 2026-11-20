import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate, useParams } from 'react-router-dom';
import { tourApi } from '../api/tourApi';
import { bookingApi } from '../api/bookingApi';
import { reviewApi } from '../api/reviewApi';
import { favoriteApi } from '../api/favoriteApi';
import { promoApi } from '../api/promoApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import PriceWithDiscount, { formatPrice } from '../components/PriceWithDiscount';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { TOUR_TYPE_LABELS } from '../components/TourCard';
import type { Review, Tour } from '../types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60';

export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const tourId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Бронирование
  const [startDate, setStartDate] = useState('');
  const [persons, setPersons] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Избранное
  const [isFavorite, setIsFavorite] = useState(false);

  // Отзыв
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const isClient = user?.role === 'CLIENT';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, r] = await Promise.all([tourApi.getById(tourId), reviewApi.getByTour(tourId)]);
      setTour(t);
      setReviews(r);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Проверяем, есть ли тур в избранном (только для клиента)
  useEffect(() => {
    if (!isClient) return;
    favoriteApi
      .getAll()
      .then((list) => setIsFavorite(list.some((t) => t.id === tourId)))
      .catch(() => undefined);
  }, [isClient, tourId]);

  const handleApplyPromo = async () => {
    setPromoMessage(null);
    if (!promoCode.trim()) return;
    try {
      const res = await promoApi.validate(promoCode.trim(), tourId);
      if (res.valid) {
        setDiscount(res.discountPercent);
        setPromoMessage({ text: res.message || `Промокод применён: скидка ${res.discountPercent}%`, ok: true });
      } else {
        setDiscount(0);
        setPromoMessage({ text: res.message || 'Промокод недействителен', ok: false });
      }
    } catch (err) {
      setDiscount(0);
      setPromoMessage({ text: getErrorMessage(err), ok: false });
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tours/${tourId}` } });
      return;
    }
    setBookingError('');
    setBookingSuccess('');
    if (!startDate) {
      setBookingError('Выберите дату начала тура');
      return;
    }
    if (persons < 1 || (tour && persons > tour.maxPersons)) {
      setBookingError(`Количество человек: от 1 до ${tour?.maxPersons ?? 10}`);
      return;
    }
    setBookingLoading(true);
    try {
      await bookingApi.create({
        tourId,
        startDate,
        persons,
        promoCode: discount > 0 ? promoCode.trim() : undefined,
      });
      setBookingSuccess('Заявка успешно создана! Отслеживайте статус в личном кабинете.');
      setPromoCode('');
      setDiscount(0);
      setPromoMessage(null);
    } catch (err) {
      setBookingError(getErrorMessage(err));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tours/${tourId}` } });
      return;
    }
    try {
      if (isFavorite) {
        await favoriteApi.remove(tourId);
        setIsFavorite(false);
      } else {
        await favoriteApi.add(tourId);
        setIsFavorite(true);
      }
    } catch {
      // 409 (уже в избранном) и прочие ошибки — просто не меняем состояние
    }
  };

  const handleSubmitReview = async () => {
    setReviewError('');
    if (!comment.trim()) {
      setReviewError('Напишите текст отзыва');
      return;
    }
    try {
      await reviewApi.create(tourId, rating, comment.trim());
      setComment('');
      setRating(5);
      await loadData();
    } catch (err) {
      setReviewError(getErrorMessage(err));
    }
  };

  const handleDeleteReview = async () => {
    if (deleteReviewId == null) return;
    try {
      await reviewApi.remove(deleteReviewId);
      setDeleteReviewId(null);
      await loadData();
    } catch (err) {
      setReviewError(getErrorMessage(err));
      setDeleteReviewId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tour) {
    return <Alert severity="error">{error || 'Тур не найден'}</Alert>;
  }

  const totalPrice = tour.price * persons;

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardMedia component="img" height="360" image={tour.imageUrl || FALLBACK_IMAGE} alt={tour.title} />
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4">{tour.title}</Typography>
            <Chip label={TOUR_TYPE_LABELS[tour.type]} color="primary" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <RatingStars value={tour.avgRating} readOnly size="medium" />
            <Typography variant="body1" color="text.secondary">
              {tour.avgRating.toFixed(1)} · отзывов: {tour.reviewsCount ?? reviews.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2, color: 'text.secondary' }}>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnIcon /> {tour.country}, {tour.city}
            </Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonthIcon /> {tour.durationDays} дней
            </Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon /> до {tour.maxPersons} человек
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {tour.description}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Форма бронирования */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Бронирование тура
            </Typography>
            {bookingError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingError}
              </Alert>
            )}
            {bookingSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {bookingSuccess}
              </Alert>
            )}
            <TextField
              label="Дата начала"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              inputProps={{ min: new Date().toISOString().slice(0, 10) }}
            />
            <TextField
              label="Количество человек"
              type="number"
              fullWidth
              margin="normal"
              value={persons}
              onChange={(e) => setPersons(Math.max(1, Number(e.target.value) || 1))}
              inputProps={{ min: 1, max: tour.maxPersons }}
            />
            {isClient && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  label="Промокод"
                  size="small"
                  fullWidth
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outlined" onClick={handleApplyPromo} sx={{ whiteSpace: 'nowrap' }}>
                  Применить
                </Button>
              </Box>
            )}
            {promoMessage && (
              <Alert severity={promoMessage.ok ? 'success' : 'warning'} sx={{ mt: 1 }}>
                {promoMessage.text}
              </Alert>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {formatPrice(tour.price)} × {persons} чел.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="subtitle1">Итого:</Typography>
              <PriceWithDiscount price={totalPrice} discountPercent={discount} />
            </Box>
            {isClient ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Отправка…' : 'Забронировать'}
              </Button>
            ) : (
              !isAuthenticated && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/login', { state: { from: `/tours/${tourId}` } })}
                >
                  Войдите, чтобы забронировать
                </Button>
              )
            )}
            {isClient && (
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
                startIcon={isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                onClick={handleToggleFavorite}
              >
                {isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Отзывы */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Отзывы ({reviews.length})
            </Typography>
            {reviews.length === 0 ? (
              <EmptyState title="Отзывов пока нет" message="Станьте первым, кто оставит отзыв" />
            ) : (
              reviews.map((rev) => (
                <Box key={rev.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {rev.user.firstName} {rev.user.lastName}
                    </Typography>
                    <RatingStars value={rev.rating} readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                    {(user?.id === rev.user.id || user?.role === 'MANAGER') && (
                      <IconButton size="small" onClick={() => setDeleteReviewId(rev.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {rev.comment}
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))
            )}

            {isClient && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Оставить отзыв
                </Typography>
                {reviewError && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {reviewError}
                  </Alert>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2">Ваша оценка:</Typography>
                  <RatingStars value={rating} onChange={setRating} size="medium" />
                </Box>
                <TextField
                  label="Ваш отзыв"
                  multiline
                  rows={3}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button variant="contained" sx={{ mt: 1 }} onClick={handleSubmitReview}>
                  Отправить
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={deleteReviewId != null}
        title="Удалить отзыв?"
        message="Отзыв будет удалён без возможности восстановления."
        confirmText="Удалить"
        danger
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
      />
    </Box>
  );
}
