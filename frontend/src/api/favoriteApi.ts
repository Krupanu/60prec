import client from './client';
import type { Tour } from '../types';

export const favoriteApi = {
  getAll: () => client.get<Tour[]>('/favorites').then((r) => r.data),

  add: (tourId: number) => client.post(`/favorites/${tourId}`),

  remove: (tourId: number) => client.delete(`/favorites/${tourId}`),
};
