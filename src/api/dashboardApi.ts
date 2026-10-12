import { apiClient } from './client';
import { ApiResponse, DashboardSummaryDto, OrderDto, SuggestionDto } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryDto> => {
    const res = await apiClient.get<ApiResponse<DashboardSummaryDto>>('/dashboard/summary');
    return res.data.data;
  },

  getUpcomingDeliveries: async (): Promise<OrderDto[]> => {
    const res = await apiClient.get<ApiResponse<OrderDto[]>>('/dashboard/upcoming-deliveries');
    return res.data.data;
  },

  getSuggestions: async (): Promise<SuggestionDto[]> => {
    const res = await apiClient.get<ApiResponse<SuggestionDto[]>>('/dashboard/suggestions');
    return res.data.data;
  },

  applySuggestion: async (key: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/dashboard/suggestions/${key}/apply`);
  },

  dismissSuggestion: async (key: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/dashboard/suggestions/${key}/dismiss`);
  },
};
