import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
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
import AddIcon from '@mui/icons-material/Add';
import { tourApi } from '../api/tourApi';
import { transportApi } from '../api/transportApi';
import { bookingApi } from '../api/bookingApi';
import { userApi } from '../api/userApi';
import { promoApi } from '../api/promoApi';
import { tripApi } from '../api/tripApi';
import { getErrorMessage } from '../api/client';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../components/PriceWithDiscount';
import { TOUR_TYPE_LABELS } from '../components/TourCard';
import type {
  Booking,
  BookingStatus,
  PromoCode,
  PromoCodeRequest,
  Role,
  Tour,
  TourRequest,
  TourType,
  Transport,
  TransportRequest,
  TransportType,
  Trip,
  User,
} from '../types';

const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  BUS: 'Автобус',
  MINIVAN: 'Минивэн',
  CAR: 'Легковой автомобиль',
};

const ROLE_LABELS: Record<Role, string> = {
  CLIENT: 'Клиент',
  VEHICLE_OWNER: 'Владелец ТС',
  MANAGER: 'Менеджер',
};

const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED', 'COMPLETED'];

// Панель менеджера: управление всеми сущностями системы
export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель менеджера
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Туры" />
        <Tab label="Транспорт" />
        <Tab label="Заявки" />
        <Tab label="Пользователи" />
        <Tab label="Промокоды" />
        <Tab label="Рейсы" />
      </Tabs>
      {tab === 0 && <ToursTab onError={setError} />}
      {tab === 1 && <TransportsTab onError={setError} />}
      {tab === 2 && <BookingsTab onError={setError} />}
      {tab === 3 && <UsersTab onError={setError} />}
      {tab === 4 && <PromoTab onError={setError} />}
      {tab === 5 && <TripsTab onError={setError} />}
    </Box>
  );
}

type TabProps = { onError: (msg: string) => void };

/* ---------- Туры ---------- */

const EMPTY_TOUR: TourRequest = {
  title: '',
  description: '',
  country: '',
  city: '',
  type: 'BEACH',
  price: 0,
  durationDays: 7,
  maxPersons: 10,
  imageUrl: '',
  active: true,
};

function ToursTab({ onError }: TabProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TourRequest>(EMPTY_TOUR);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    tourApi
      .getAll({ page, size: 10 })
      .then((data) => {
        setTours(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => onError(getErrorMessage(err)));
  }, [page, onError]);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_TOUR);
    setDialogOpen(true);
  };

  const openEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setForm({
      title: tour.title,
      description: tour.description,
      country: tour.country,
      city: tour.city,
      type: tour.type,
      price: tour.price,
      durationDays: tour.durationDays,
      maxPersons: tour.maxPersons,
      imageUrl: tour.imageUrl ?? '',
      active: tour.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId != null) await tourApi.update(editingId, form);
      else await tourApi.create(form);
      setDialogOpen(false);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await tourApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mb: 2 }}>
        Добавить тур
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Страна</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tours.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.country}</TableCell>
                <TableCell>{TOUR_TYPE_LABELS[t.type]}</TableCell>
                <TableCell>{formatPrice(t.price)}</TableCell>
                <TableCell>{t.active ? 'Да' : 'Нет'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(t)} sx={{ mr: 1 }}>
                    Изменить
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteId(t.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId != null ? 'Редактировать тур' : 'Новый тур'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth sx={{ mt: 1 }} />
          <TextField label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Страна" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required fullWidth />
            <TextField label="Город" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required fullWidth />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Тип тура</InputLabel>
            <Select label="Тип тура" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TourType })}>
              {(Object.keys(TOUR_TYPE_LABELS) as TourType[]).map((t) => (
                <MenuItem key={t} value={t}>
                  {TOUR_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Цена, BYN" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} fullWidth inputProps={{ min: 0 }} />
            <TextField label="Длительность, дн." type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} fullWidth inputProps={{ min: 1 }} />
            <TextField label="Макс. человек" type="number" value={form.maxPersons} onChange={(e) => setForm({ ...form, maxPersons: Number(e.target.value) })} fullWidth inputProps={{ min: 1 }} />
          </Box>
          <TextField label="URL изображения" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
          <FormControlLabel
            control={<Checkbox checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
            label="Активен (отображается в каталоге)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        title="Удалить тур?"
        message="Тур будет скрыт из каталога (мягкое удаление)."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

/* ---------- Транспорт ---------- */

const EMPTY_TRANSPORT: TransportRequest = {
  model: '',
  plateNumber: '',
  type: 'BUS',
  seats: 40,
  ownerId: 0,
};

function TransportsTab({ onError }: TabProps) {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TransportRequest>(EMPTY_TRANSPORT);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    transportApi
      .getAll()
      .then((data) => setTransports(data.content))
      .catch((err) => onError(getErrorMessage(err)));
  }, [onError]);

  useEffect(() => {
    load();
    // Владельцы выбираются из пользователей с ролью VEHICLE_OWNER
    userApi
      .getAll('', 'VEHICLE_OWNER')
      .then((data) => setOwners(data.content))
      .catch(() => undefined);
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_TRANSPORT);
    setDialogOpen(true);
  };

  const openEdit = (t: Transport) => {
    setEditingId(t.id);
    setForm({
      model: t.model,
      plateNumber: t.plateNumber,
      type: t.type,
      seats: t.seats,
      ownerId: t.owner?.id ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.ownerId) {
      onError('Выберите владельца транспортного средства');
      return;
    }
    try {
      if (editingId != null) await transportApi.update(editingId, form);
      else await transportApi.create(form);
      setDialogOpen(false);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await transportApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mb: 2 }}>
        Добавить транспорт
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Модель</TableCell>
              <TableCell>Гос. номер</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Мест</TableCell>
              <TableCell>Владелец</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transports.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.model}</TableCell>
                <TableCell>{t.plateNumber}</TableCell>
                <TableCell>{TRANSPORT_TYPE_LABELS[t.type]}</TableCell>
                <TableCell>{t.seats}</TableCell>
                <TableCell>
                  {t.owner ? `${t.owner.firstName} ${t.owner.lastName}` : '—'}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(t)} sx={{ mr: 1 }}>
                    Изменить
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteId(t.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId != null ? 'Редактировать ТС' : 'Новое транспортное средство'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Модель" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required fullWidth sx={{ mt: 1 }} />
          <TextField label="Гос. номер" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Тип</InputLabel>
              <Select label="Тип" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransportType })}>
                {(Object.keys(TRANSPORT_TYPE_LABELS) as TransportType[]).map((t) => (
                  <MenuItem key={t} value={t}>
                    {TRANSPORT_TYPE_LABELS[t]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Количество мест" type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} fullWidth inputProps={{ min: 1 }} />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Владелец</InputLabel>
            <Select label="Владелец" value={form.ownerId || ''} onChange={(e) => setForm({ ...form, ownerId: Number(e.target.value) })}>
              {owners.length === 0 && <MenuItem value="">Нет пользователей с ролью «Владелец ТС»</MenuItem>}
              {owners.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.lastName} {u.firstName} ({u.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        title="Удалить транспортное средство?"
        message="ТС будет удалено из системы."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

/* ---------- Заявки ---------- */

function BookingsTab({ onError }: TabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(() => {
    bookingApi
      .getAll(statusFilter, page, 15)
      .then((data) => {
        setBookings(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => onError(getErrorMessage(err)));
  }, [statusFilter, page, onError]);

  useEffect(load, [load]);

  const handleSetStatus = async (id: number, status: BookingStatus) => {
    try {
      await bookingApi.setStatus(id, status);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 240, mb: 2 }}>
        <InputLabel>Фильтр по статусу</InputLabel>
        <Select
          label="Фильтр по статусу"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as BookingStatus | '');
            setPage(0);
          }}
        >
          <MenuItem value="">Все заявки</MenuItem>
          {BOOKING_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              <StatusChip status={s} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {bookings.length === 0 ? (
        <EmptyState title="Заявок нет" message="Заявки с выбранным статусом отсутствуют" />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Тур</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Чел.</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Сменить статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.user ? `${b.user.firstName} ${b.user.lastName}` : '—'}</TableCell>
                  <TableCell>{b.tour.title}</TableCell>
                  <TableCell>{new Date(b.startDate).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>{b.persons}</TableCell>
                  <TableCell>{formatPrice(b.totalPrice)}</TableCell>
                  <TableCell>
                    <StatusChip status={b.status} />
                  </TableCell>
                  <TableCell align="right">
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value={b.status}
                        onChange={(e) => handleSetStatus(b.id, e.target.value as BookingStatus)}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>
                            <StatusChip status={s} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} />
        </Box>
      )}
    </Box>
  );
}

/* ---------- Пользователи ---------- */

function UsersTab({ onError }: TabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    userApi
      .getAll(search, roleFilter)
      .then((data) => setUsers(data.content))
      .catch((err) => onError(getErrorMessage(err)));
  }, [search, roleFilter, onError]);

  useEffect(load, [load]);

  const handleToggleBlock = async (u: User) => {
    try {
      await userApi.setBlocked(u.id, !u.blocked);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleSetRole = async (id: number, role: Role) => {
    try {
      await userApi.setRole(id, role);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await userApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Поиск (имя, e-mail)"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Роль</InputLabel>
          <Select label="Роль" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | '')}>
            <MenuItem value="">Все роли</MenuItem>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <MenuItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>ФИО</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>
                  {u.lastName} {u.firstName}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone || '—'}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select value={u.role} onChange={(e) => handleSetRole(u.id, e.target.value as Role)}>
                      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                        <MenuItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{u.blocked ? 'Заблокирован' : 'Активен'}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    color={u.blocked ? 'success' : 'warning'}
                    onClick={() => handleToggleBlock(u)}
                    sx={{ mr: 1 }}
                  >
                    {u.blocked ? 'Разблокировать' : 'Заблокировать'}
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteId(u.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={deleteId != null}
        title="Удалить пользователя?"
        message="Пользователь будет удалён без возможности восстановления."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

/* ---------- Промокоды ---------- */

const EMPTY_PROMO: PromoCodeRequest = {
  code: '',
  discountPercent: 10,
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  maxUses: 100,
  active: true,
};

function PromoTab({ onError }: TabProps) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PromoCodeRequest>(EMPTY_PROMO);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    promoApi
      .getAll()
      .then((data) => setPromos(data.content))
      .catch((err) => onError(getErrorMessage(err)));
  }, [onError]);

  useEffect(load, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_PROMO);
    setDialogOpen(true);
  };

  const openEdit = (p: PromoCode) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      discountPercent: p.discountPercent,
      validFrom: p.validFrom ? p.validFrom.slice(0, 10) : EMPTY_PROMO.validFrom,
      validTo: p.validTo ? p.validTo.slice(0, 10) : EMPTY_PROMO.validTo,
      maxUses: p.maxUses,
      active: p.active,
    });
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      onError('Укажите код промокода');
      return;
    }
    if (form.discountPercent < 1 || form.discountPercent > 90) {
      onError('Скидка должна быть от 1 до 90%');
      return;
    }
    try {
      if (editingId != null) await promoApi.update(editingId, form);
      else await promoApi.create(form);
      setDialogOpen(false);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await promoApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mb: 2 }}>
        Добавить промокод
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Скидка</TableCell>
              <TableCell>Действует</TableCell>
              <TableCell>Использований</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promos.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{p.code}</TableCell>
                <TableCell>{p.discountPercent}%</TableCell>
                <TableCell>
                  {new Date(p.validFrom).toLocaleDateString('ru-RU')} —{' '}
                  {new Date(p.validTo).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell>
                  {p.usedCount} / {p.maxUses}
                </TableCell>
                <TableCell>{p.active ? 'Да' : 'Нет'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(p)} sx={{ mr: 1 }}>
                    Изменить
                  </Button>
                  <Button size="small" color="error" onClick={() => setDeleteId(p.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId != null ? 'Редактировать промокод' : 'Новый промокод'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Код" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required fullWidth sx={{ mt: 1 }} />
          <TextField label="Скидка, %" type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} fullWidth inputProps={{ min: 1, max: 90 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Действует с" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Действует до" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
          <TextField label="Макс. использований" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} fullWidth inputProps={{ min: 1 }} />
          <FormControlLabel
            control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
            label="Активен"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        title="Удалить промокод?"
        message="Промокод будет удалён без возможности восстановления."
        confirmText="Удалить"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

/* ---------- Рейсы ---------- */

function TripsTab({ onError }: TabProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tourId, setTourId] = useState<number | ''>('');
  const [transportId, setTransportId] = useState<number | ''>('');
  const [departureDate, setDepartureDate] = useState('');
  const [cancelId, setCancelId] = useState<number | null>(null);

  const load = useCallback(() => {
    tripApi
      .getAll()
      .then((data) => setTrips(data.content))
      .catch((err) => onError(getErrorMessage(err)));
  }, [onError]);

  useEffect(() => {
    load();
    tourApi
      .getAll({ size: 100 })
      .then((data) => setTours(data.content))
      .catch(() => undefined);
    transportApi
      .getAll()
      .then((data) => setTransports(data.content))
      .catch(() => undefined);
  }, [load]);

  const handleCreate = async () => {
    if (!tourId || !transportId || !departureDate) {
      onError('Заполните все поля: тур, транспорт и дата выезда');
      return;
    }
    try {
      await tripApi.create(tourId, transportId, departureDate);
      setDialogOpen(false);
      setTourId('');
      setTransportId('');
      setDepartureDate('');
      load();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (cancelId == null) return;
    try {
      await tripApi.cancel(cancelId);
      setCancelId(null);
      load();
    } catch (err) {
      onError(getErrorMessage(err));
      setCancelId(null);
    }
  };

  return (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ mb: 2 }}>
        Назначить рейс
      </Button>
      {trips.length === 0 ? (
        <EmptyState title="Рейсов нет" message="Назначьте транспортное средство на тур" />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Тур</TableCell>
                <TableCell>Транспорт</TableCell>
                <TableCell>Владелец</TableCell>
                <TableCell>Дата выезда</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id} hover>
                  <TableCell>{trip.id}</TableCell>
                  <TableCell>{trip.tour.title}</TableCell>
                  <TableCell>
                    {trip.transport.model} ({trip.transport.plateNumber})
                  </TableCell>
                  <TableCell>
                    {trip.transport.owner
                      ? `${trip.transport.owner.firstName} ${trip.transport.owner.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell>{new Date(trip.departureDate).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <StatusChip status={trip.status} kind="trip" />
                  </TableCell>
                  <TableCell align="right">
                    {trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED' && (
                      <Button size="small" color="error" onClick={() => setCancelId(trip.id)}>
                        Отменить рейс
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Назначить транспорт на тур</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Тур</InputLabel>
            <Select label="Тур" value={tourId} onChange={(e) => setTourId(Number(e.target.value))}>
              {tours.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.title} ({t.country}, {t.city})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Транспортное средство</InputLabel>
            <Select label="Транспортное средство" value={transportId} onChange={(e) => setTransportId(Number(e.target.value))}>
              {transports.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {TRANSPORT_TYPE_LABELS[t.type]} · {t.model} ({t.plateNumber}) · {t.seats} мест
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Дата выезда"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate}>
            Создать рейс
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={cancelId != null}
        title="Отменить рейс?"
        message="Рейс будет отменён, владелец ТС увидит новый статус."
        confirmText="Отменить рейс"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </Box>
  );
}
