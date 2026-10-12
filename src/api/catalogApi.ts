import { apiClient } from './client';
import { ApiResponse, Category, Product } from '../types';

export interface ProductSearchParams {
  category?: string;
  categoryId?: string;
  query?: string;
  search?: string;
  organic?: boolean;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export type ProductFilterParams = ProductSearchParams;

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  getProducts: async (params?: ProductSearchParams): Promise<PageResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  getRelatedProducts: async (id: string): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>(`/products/${id}/related`);
    return res.data.data;
  },

  // Admin endpoints
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/admin/products', data);
    return res.data.data;
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return res.data.data;
  },

  updateAvailability: async (id: string, isAvailable: boolean): Promise<Product> => {
    const res = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}/availability`, { isAvailable });
    return res.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },
};
