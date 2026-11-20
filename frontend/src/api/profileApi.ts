import client from './client';
import type { User } from '../types';

export const profileApi = {
  get: () => client.get<User>('/profile').then((r) => r.data),

  update: (data: { firstName: string; lastName: string; phone: string }) =>
    client.put<User>('/profile', data).then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    client.patch('/profile/password', { oldPassword, newPassword }),
};
