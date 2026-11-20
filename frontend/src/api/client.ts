import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types';

export const TOKEN_KEY = 'tourfirm_token';
export const USER_KEY = 'tourfirm_user';

// Axios-инстанс: baseURL из переменной окружения, по умолчанию '/api/v1'
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

// Подставляем Bearer-токен из localStorage в каждый запрос
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// При 401 — разлогиниваем и отправляем на страницу входа
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Извлекает человекочитаемое сообщение об ошибке из ответа сервера
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.message) return body.message;
    if (error.response?.status === 403) return 'Доступ запрещён';
    if (error.response?.status === 404) return 'Ресурс не найден';
    if (!error.response) return 'Сервер недоступен. Попробуйте позже';
  }
  return 'Произошла ошибка. Попробуйте позже';
}

export default client;
