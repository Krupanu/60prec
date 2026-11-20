import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import type { BookingStatus, TripStatus } from '../types';

const BOOKING_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  PAID: 'Оплачена',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завершена',
};

const TRIP_LABELS: Record<TripStatus, string> = {
  SCHEDULED: 'Запланирован',
  READY: 'Готов к выезду',
  EN_ROUTE: 'В пути',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
};

const COLORS: Record<string, ChipProps['color']> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PAID: 'success',
  CANCELLED: 'default',
  COMPLETED: 'success',
  SCHEDULED: 'info',
  READY: 'warning',
  EN_ROUTE: 'primary',
};

interface Props {
  status: BookingStatus | TripStatus | string;
  kind?: 'booking' | 'trip';
}

export default function StatusChip({ status, kind = 'booking' }: Props) {
  const label =
    kind === 'trip'
      ? TRIP_LABELS[status as TripStatus] ?? status
      : BOOKING_LABELS[status as BookingStatus] ?? status;
  return <Chip label={label} color={COLORS[status] ?? 'default'} size="small" />;
}
