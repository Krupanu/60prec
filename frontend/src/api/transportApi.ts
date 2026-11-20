import client from './client';
import type { Page, Transport, TransportRequest } from '../types';

export const transportApi = {
  getAll: (page = 0, size = 100) =>
    client.get<Page<Transport>>('/transports', { params: { page, size } }).then((r) => r.data),

  getById: (id: number) => client.get<Transport>(`/transports/${id}`).then((r) => r.data),

  getMy: () => client.get<Transport[]>('/transports/my').then((r) => r.data),

  create: (data: TransportRequest) =>
    client.post<Transport>('/transports', data).then((r) => r.data),

  update: (id: number, data: TransportRequest) =>
    client.put<Transport>(`/transports/${id}`, data).then((r) => r.data),

  remove: (id: number) => client.delete(`/transports/${id}`),
};
