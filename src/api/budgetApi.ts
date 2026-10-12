import { apiClient } from './client';
import { ApiResponse, BudgetSummaryDto, AnalyticsSummaryDto, SpendingDataPointDto, CategorySpendingDto } from '../types';

export const budgetApi = {
  getBudgetSummary: async (): Promise<BudgetSummaryDto> => {
    const res = await apiClient.get<ApiResponse<BudgetSummaryDto>>('/budgets');
    return res.data.data;
  },

  updateWeeklyBudget: async (amount: number): Promise<BudgetSummaryDto> => {
    const res = await apiClient.put<ApiResponse<BudgetSummaryDto>>('/budgets/weekly', { amount });
    return res.data.data;
  },

  updateMonthlyBudget: async (amount: number): Promise<BudgetSummaryDto> => {
    const res = await apiClient.put<ApiResponse<BudgetSummaryDto>>('/budgets/monthly', { amount });
    return res.data.data;
  },

  getAnalyticsSummary: async (): Promise<AnalyticsSummaryDto> => {
    const res = await apiClient.get<ApiResponse<AnalyticsSummaryDto>>('/analytics/summary');
    return res.data.data;
  },

  getSpendingTrends: async (): Promise<SpendingDataPointDto[]> => {
    const res = await apiClient.get<ApiResponse<SpendingDataPointDto[]>>('/analytics/spending');
    return res.data.data;
  },

  getCategoryBreakdown: async (): Promise<CategorySpendingDto[]> => {
    const res = await apiClient.get<ApiResponse<CategorySpendingDto[]>>('/analytics/categories');
    return res.data.data;
  },
};
