import client from './client';
import type { DocumentItem } from '../types';

export const documentApi = {
  // Загрузка файла к рейсу (multipart/form-data)
  upload: (tripId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client
      .post<DocumentItem>(`/trips/${tripId}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  getByTrip: (tripId: number) =>
    client.get<DocumentItem[]>(`/trips/${tripId}/documents`).then((r) => r.data),

  download: (id: number) =>
    client
      .get<Blob>(`/documents/${id}/download`, { responseType: 'blob' })
      .then((r) => r.data),

  remove: (id: number) => client.delete(`/documents/${id}`),
};
