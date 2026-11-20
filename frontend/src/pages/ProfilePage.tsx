import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/profileApi';
import { bookingApi } from '../api/bookingApi';
import { favoriteApi } from '../api/favoriteApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../components/PriceWithDiscount';
import type { Booking, Tour, User } from '../types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60';

// Личный кабинет клиента: данные, заявки, избранное
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Личный кабинет
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Личные данные" />
        <Tab label="Мои заявки" />
        <Tab label="Избранное" />
      </Tabs>
      {tab === 0 && <PersonalDataTab user={user} updateUser={updateUser} />}
      {tab === 1 && <BookingsTab />}
      {tab === 2 && <FavoritesTab navigate={navigate} />}
    </Box>
  );
}

interface PersonalProps {
  user: ReturnType<typeof useAuth>['user'];
  updateUser: ReturnType<typeof useAuth>['updateUser'];
}

function PersonalDataTab({ user, updateUser }: PersonalProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saveMessage, setSaveMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pwMessage, setPwMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    profileApi
      .get()
      .then((u: User) =>
        setForm({ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? '' }),
      )
      .catch(() => undefined);
  }, []);

  const handleSave = async () => {
    setSaveMessage(null);
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSaveMessage({ text: 'Имя и фамилия обязательны', ok: false });
      return;
    }
    try {
      const u = await profileApi.update({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      if (user) {
        updateUser({
          ...user,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
        });
      }
      setSaveMessage({ text: 'Данные сохранены', ok: true });
    } catch (err) {
      setSaveMessage({ text: getErrorMessage(err), ok: false });
    }
  };

  const handleChangePassword = async () => {
    setPwMessage(null);
    if (pw.newPassword.length < 6) {
      setPwMessage({ text: 'Новый пароль не короче 6 символов', ok: false });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMessage({ text: 'Пароли не совпадают', ok: false });
      return;
    }
    try {
      await profileApi.changePassword(pw.oldPassword, pw.newPassword);
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      setPwMessage({ text: 'Пароль успешно изменён', ok: true });
    } catch (err) {
      setPwMessage({ text: getErrorMessage(err), ok: false });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Личные данные
          </Typography>
          {saveMessage && (
            <Alert severity={saveMessage.ok ? 'success' : 'error'} sx={{ mb: 2 }}>
              {saveMessage.text}
            </Alert>
          )}
          <TextField
            label="Имя"
            fullWidth
            margin="normal"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <TextField
            label="Фамилия"
            fullWidth
            margin="normal"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          />
          <TextField
            label="Телефон"
            fullWidth
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <TextField label="E-mail" fullWidth margin="normal" value={user?.email ?? ''} disabled />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
            Сохранить
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Смена пароля
          </Typography>
          {pwMessage && (
            <Alert severity={pwMessage.ok ? 'success' : 'error'} sx={{ mb: 2 }}>
              {pwMessage.text}
            </Alert>
          )}
          <TextField
            label="Текущий пароль"
            type="password"
            fullWidth
            margin="normal"
            value={pw.oldPassword}
            onChange={(e) => setPw((p) => ({ ...p, oldPassword: e.target.value }))}
          />
          <TextField
            label="Новый пароль"
            type="password"
            fullWidth
            margin="normal"
            value={pw.newPassword}
            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <TextField
            label="Повторите новый пароль"
            type="password"
            fullWidth
            margin="normal"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleChangePassword}>
            Изменить пароль
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [payId, setPayId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    bookingApi
      .getMy()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(load, [load]);

  const handlePay = async () => {
    if (payId == null) return;
    setActionLoading(true);
    try {
      await bookingApi.pay(payId);
      setPayId(null);
      setPaySuccess(true);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setPayId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (cancelId == null) return;
    setActionLoading(true);
    try {
      await bookingApi.cancel(cancelId);
      setCancelId(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
      setCancelId(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {bookings.length === 0 ? (
        <EmptyState title="У вас пока нет заявок" message="Выберите тур в каталоге и оформите бронирование" />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Тур</TableCell>
                <TableCell>Дата начала</TableCell>
                <TableCell>Человек</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.tour.title}</TableCell>
                  <TableCell>{new Date(b.startDate).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>{b.persons}</TableCell>
                  <TableCell>{formatPrice(b.totalPrice)}</TableCell>
                  <TableCell>
                    <StatusChip status={b.status} />
                  </TableCell>
                  <TableCell align="right">
                    {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                      <>
                        <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => setPayId(b.id)}>
                          Оплатить
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => setCancelId(b.id)}>
                          Отменить
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Подтверждение оплаты (имитация) */}
      <ConfirmDialog
        open={payId != null}
        title="Оплата заявки"
        message="Это имитация оплаты: реальное списание средств не производится. Подтвердить оплату?"
        confirmText="Оплатить"
        loading={actionLoading}
        onConfirm={handlePay}
        onCancel={() => setPayId(null)}
      />
      {/* Диалог успешной оплаты */}
      <Dialog open={paySuccess} onClose={() => setPaySuccess(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56, verticalAlign: 'middle' }} />
        </DialogTitle>
        <DialogContent>
          <Typography align="center" variant="h6">
            Оплата прошла успешно!
          </Typography>
          <Typography align="center" variant="body2" color="text.secondary">
            Статус заявки изменён на «Оплачена»
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={() => setPaySuccess(false)}>
            Отлично
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={cancelId != null}
        title="Отменить заявку?"
        message="Заявка будет отменена. Это действие нельзя отменить."
        confirmText="Отменить заявку"
        danger
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </Box>
  );
}

function FavoritesTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [favorites, setFavorites] = useState<Tour[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    favoriteApi
      .getAll()
      .then(setFavorites)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(load, [load]);

  const handleRemove = async (tourId: number) => {
    try {
      await favoriteApi.remove(tourId);
      setFavorites((list) => list.filter((t) => t.id !== tourId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {favorites.length === 0 ? (
        <EmptyState
          title="Избранное пусто"
          message="Добавляйте туры в избранное, чтобы не потерять их"
        />
      ) : (
        <Grid container spacing={3}>
          {favorites.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="160"
                  image={tour.imageUrl || FALLBACK_IMAGE}
                  alt={tour.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {tour.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tour.country}, {tour.city} · {tour.durationDays} дн.
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {formatPrice(tour.price)}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" variant="contained" onClick={() => navigate(`/tours/${tour.id}`)}>
                    Подробнее
                  </Button>
                  <Button size="small" color="error" onClick={() => handleRemove(tour.id)}>
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
