import client from './client';
import type { Review } from '../types';

export const reviewApi = {
  getByTour: (tourId: number) =>
    client.get<Review[]>(`/tours/${tourId}/reviews`).then((r) => r.data),

  create: (tourId: number, rating: number, comment: string) =>
    client.post<Review>(`/tours/${tourId}/reviews`, { rating, comment }).then((r) => r.data),

  remove: (id: number) => client.delete(`/reviews/${id}`),
};
