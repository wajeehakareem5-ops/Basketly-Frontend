import { apiClient } from './client';
import { ApiResponse, ProductDto } from '../types';

export const favoriteApi = {
  getFavorites: async (): Promise<ProductDto[]> => {
    const res = await apiClient.get<ApiResponse<ProductDto[]>>('/favorites');
    return res.data.data;
  },

  addFavorite: async (productId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/favorites/${productId}`);
  },

  removeFavorite: async (productId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/favorites/${productId}`);
  },
};
