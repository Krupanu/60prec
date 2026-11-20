import client from './client';
import type { Page, Trip, TripStatus } from '../types';

export const tripApi = {
  create: (tourId: number, transportId: number, departureDate: string) =>
    client.post<Trip>('/trips', { tourId, transportId, departureDate }).then((r) => r.data),

  getAll: (status?: TripStatus | '', page = 0, size = 50) => {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    return client.get<Page<Trip>>('/trips', { params }).then((r) => r.data);
  },

  getMy: () => client.get<Trip[]>('/trips/my').then((r) => r.data),

  // VEHICLE_OWNER: смена статуса рейса (READY | EN_ROUTE | COMPLETED)
  setStatus: (id: number, status: TripStatus) =>
    client.patch<Trip>(`/trips/${id}/status`, { status }).then((r) => r.data),

  // MANAGER: отмена рейса
  cancel: (id: number) => client.patch<Trip>(`/trips/${id}/cancel`).then((r) => r.data),
};
