import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export interface AuthResponseData {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', { email, password });
    return res.data.data;
  },

  register: async (fullName: string, email: string, password: string): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', { fullName, email, password });
    return res.data.data;
  },

  refresh: async (): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/refresh');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  forgotPassword: async (email: string): Promise<{ token?: string; message: string }> => {
    const res = await apiClient.post<ApiResponse<{ token?: string; message: string }>>('/auth/forgot-password', { email });
    return res.data.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },
};
