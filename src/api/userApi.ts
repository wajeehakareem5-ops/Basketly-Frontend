import { apiClient } from './client';
import { ApiResponse, UserSettingsDto, AddressDto } from '../types';

export const userApi = {
  getSettings: async (): Promise<UserSettingsDto> => {
    const res = await apiClient.get<ApiResponse<UserSettingsDto>>('/settings');
    return res.data.data;
  },

  updateSettings: async (settings: UserSettingsDto): Promise<UserSettingsDto> => {
    const res = await apiClient.put<ApiResponse<UserSettingsDto>>('/settings', settings);
    return res.data.data;
  },

  changePassword: async (passwords: { oldPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/settings/change-password', passwords);
  },

  getAddresses: async (): Promise<AddressDto[]> => {
    const res = await apiClient.get<ApiResponse<AddressDto[]>>('/addresses');
    return res.data.data;
  },

  createAddress: async (address: Omit<AddressDto, 'id'>): Promise<AddressDto> => {
    const res = await apiClient.post<ApiResponse<AddressDto>>('/addresses', address);
    return res.data.data;
  },

  updateAddress: async (id: string, address: AddressDto): Promise<AddressDto> => {
    const res = await apiClient.put<ApiResponse<AddressDto>>(`/addresses/${id}`, address);
    return res.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/addresses/${id}`);
  },
};
