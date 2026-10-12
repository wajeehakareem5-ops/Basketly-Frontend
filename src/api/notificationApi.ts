import { apiClient } from './client';
import { ApiResponse, NotificationDto } from '../types';

interface NotificationsResponse {
  notifications: NotificationDto[];
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: async (): Promise<NotificationsResponse> => {
    const res = await apiClient.get<ApiResponse<NotificationsResponse>>('/notifications');
    return res.data.data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/notifications/read-all');
  },
};
