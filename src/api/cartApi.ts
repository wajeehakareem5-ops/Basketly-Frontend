import { apiClient } from './client';
import { ApiResponse, Cart } from '../types';

export const cartApi = {
  getCart: async (coupon?: string): Promise<Cart> => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart', {
      params: coupon ? { coupon } : undefined,
    });
    return res.data.data;
  },

  addItem: async (productId: string, quantity = 1, coupon?: string): Promise<Cart> => {
    const res = await apiClient.post<ApiResponse<Cart>>(
      '/cart/items',
      { productId, quantity },
      { params: coupon ? { coupon } : undefined }
    );
    return res.data.data;
  },

  updateQuantity: async (itemId: string, quantity: number, coupon?: string): Promise<Cart> => {
    const res = await apiClient.patch<ApiResponse<Cart>>(
      `/cart/items/${itemId}`,
      { quantity },
      { params: coupon ? { coupon } : undefined }
    );
    return res.data.data;
  },

  removeItem: async (itemId: string, coupon?: string): Promise<Cart> => {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      params: coupon ? { coupon } : undefined,
    });
    return res.data.data;
  },

  applyCoupon: async (code: string): Promise<Cart> => {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/coupons', { code });
    return res.data.data;
  },

  removeCoupon: async (): Promise<Cart> => {
    const res = await apiClient.delete<ApiResponse<Cart>>('/cart/coupons');
    return res.data.data;
  },
};
