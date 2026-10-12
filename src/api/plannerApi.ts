import { apiClient } from './client';
import { ApiResponse, PlannedItem, WeeklyPlan } from '../types';

export interface CreatePlannedItemData {
  productId: string;
  planDate: string;
  quantity?: number;
  notes?: string;
}

export interface UpdatePlannedItemData {
  quantity?: number;
  notes?: string;
  completed?: boolean;
  planDate?: string;
}

export interface CreateRecurringRuleData {
  productId: string;
  frequency: string;
  targetDayOfWeek?: string;
  quantity?: number;
  startDate: string;
  endDate?: string;
}

export interface RecurrencePreview {
  projectedDates: string[];
  totalOccurrences: number;
  estimatedTotalCost: number;
}

export const plannerApi = {
  getWeeklyPlan: async (weekStartDate: string): Promise<WeeklyPlan> => {
    const res = await apiClient.get<ApiResponse<WeeklyPlan>>(`/planner/weeks/${weekStartDate}`);
    return res.data.data;
  },

  copyWeek: async (sourceWeekStart: string, targetWeekStart: string): Promise<void> => {
    await apiClient.post('/planner/weeks/copy', { sourceWeekStart, targetWeekStart });
  },

  addPlannedItem: async (date: string, data: CreatePlannedItemData): Promise<PlannedItem> => {
    const res = await apiClient.post<ApiResponse<PlannedItem>>(`/planner/days/${date}/items`, data);
    return res.data.data;
  },

  updatePlannedItem: async (id: string, data: UpdatePlannedItemData): Promise<PlannedItem> => {
    const res = await apiClient.patch<ApiResponse<PlannedItem>>(`/planner/items/${id}`, data);
    return res.data.data;
  },

  deletePlannedItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/planner/items/${id}`);
  },

  toggleComplete: async (id: string): Promise<PlannedItem> => {
    const res = await apiClient.post<ApiResponse<PlannedItem>>(`/planner/items/${id}/complete`);
    return res.data.data;
  },

  copyDay: async (date: string, targetDate: string): Promise<void> => {
    await apiClient.post(`/planner/days/${date}/copy`, { targetDate });
  },

  clearDay: async (date: string): Promise<void> => {
    await apiClient.delete(`/planner/days/${date}`);
  },

  previewRecurrence: async (data: CreateRecurringRuleData): Promise<RecurrencePreview> => {
    const res = await apiClient.post<ApiResponse<RecurrencePreview>>('/planner/recurrences/preview', data);
    return res.data.data;
  },

  createRecurringRule: async (data: CreateRecurringRuleData): Promise<void> => {
    await apiClient.post('/planner/recurrences', data);
  },
};
