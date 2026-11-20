import client from './client';
import type { Page, PromoCode, PromoCodeRequest, PromoValidation } from '../types';

export const promoApi = {
  getAll: (page = 0, size = 50) =>
    client.get<Page<PromoCode>>('/promocodes', { params: { page, size } }).then((r) => r.data),

  create: (data: PromoCodeRequest) =>
    client.post<PromoCode>('/promocodes', data).then((r) => r.data),

  update: (id: number, data: PromoCodeRequest) =>
    client.put<PromoCode>(`/promocodes/${id}`, data).then((r) => r.data),

  remove: (id: number) => client.delete(`/promocodes/${id}`),

  validate: (code: string, tourId: number) =>
    client
      .post<PromoValidation>('/promocodes/validate', { code, tourId })
      .then((r) => r.data),
};
