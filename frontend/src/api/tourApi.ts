import client from './client';
import type { Page, Tour, TourRequest, TourType } from '../types';

export interface TourFilter {
  search?: string;
  country?: string;
  type?: TourType | '';
  minPrice?: number | '';
  maxPrice?: number | '';
  page?: number;
  size?: number;
  sort?: string;
}

export const tourApi = {
  getAll: (filter: TourFilter) => {
    const params: Record<string, unknown> = {
      page: filter.page ?? 0,
      size: filter.size ?? 12,
    };
    if (filter.search) params.search = filter.search;
    if (filter.country) params.country = filter.country;
    if (filter.type) params.type = filter.type;
    if (filter.minPrice !== '' && filter.minPrice != null) params.minPrice = filter.minPrice;
    if (filter.maxPrice !== '' && filter.maxPrice != null) params.maxPrice = filter.maxPrice;
    if (filter.sort) params.sort = filter.sort;
    return client.get<Page<Tour>>('/tours', { params }).then((r) => r.data);
  },

  getById: (id: number) => client.get<Tour>(`/tours/${id}`).then((r) => r.data),

  create: (data: TourRequest) => client.post<Tour>('/tours', data).then((r) => r.data),

  update: (id: number, data: TourRequest) =>
    client.put<Tour>(`/tours/${id}`, data).then((r) => r.data),

  remove: (id: number) => client.delete(`/tours/${id}`),
};
