import client from './client';
import type { Booking, BookingCreateRequest, BookingStatus, Page } from '../types';

export const bookingApi = {
  create: (data: BookingCreateRequest) =>
    client.post<Booking>('/bookings', data).then((r) => r.data),

  getMy: () => client.get<Booking[]>('/bookings/my').then((r) => r.data),

  getById: (id: number) => client.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  cancel: (id: number) => client.post(`/bookings/${id}/cancel`),

  pay: (id: number) => client.post<Booking>(`/bookings/${id}/pay`).then((r) => r.data),

  // MANAGER: список заявок с фильтром по статусу
  getAll: (status?: BookingStatus | '', page = 0, size = 20) => {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    return client.get<Page<Booking>>('/bookings', { params }).then((r) => r.data);
  },

  setStatus: (id: number, status: BookingStatus) =>
    client.patch<Booking>(`/bookings/${id}/status`, { status }).then((r) => r.data),
};
