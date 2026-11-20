import client from './client';
import type { AuthResponse, User } from '../types';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (data: RegisterRequest) =>
    client.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  me: () => client.get<User>('/auth/me').then((r) => r.data),
};
