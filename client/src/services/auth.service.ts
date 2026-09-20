import { fetchApi } from './api';

export const authService = {
  login: (data: { email: string; password: string }) =>
    fetchApi<{ success: boolean; data: { user: any; accessToken: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    fetchApi<{ success: boolean; data: { user: any; accessToken: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    fetchApi<{ success: boolean; data: any }>('/auth/me'),

  updateProfile: (data: { name: string }) =>
    fetchApi<{ success: boolean; data: any }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword?: string; newPassword?: string }) =>
    fetchApi<{ success: boolean; data: any }>('/auth/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
