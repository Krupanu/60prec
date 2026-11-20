import client from './client';
import type { Page, Role, User } from '../types';

export const userApi = {
  getAll: (search = '', role: Role | '' = '', page = 0, size = 100) => {
    const params: Record<string, unknown> = { page, size };
    if (search) params.search = search;
    if (role) params.role = role;
    return client.get<Page<User>>('/users', { params }).then((r) => r.data);
  },

  getById: (id: number) => client.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: number, data: Partial<User>) =>
    client.put<User>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: number) => client.delete(`/users/${id}`),

  setRole: (id: number, role: Role) =>
    client.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  setBlocked: (id: number, blocked: boolean) =>
    client.patch<User>(`/users/${id}/block`, { blocked }).then((r) => r.data),
};
