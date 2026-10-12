import { apiClient } from './client';
import { ApiResponse, OrderDto, PageResponse } from '../types';

export const orderApi = {
  getOrders: async (status?: string, page = 0, size = 10): Promise<PageResponse<OrderDto>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const res = await apiClient.get<ApiResponse<PageResponse<OrderDto>>>(`/orders?${params.toString()}`);
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<OrderDto> => {
    const res = await apiClient.get<ApiResponse<OrderDto>>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string): Promise<OrderDto> => {
    const res = await apiClient.post<ApiResponse<OrderDto>>(`/orders/${id}/cancel`);
    return res.data.data;
  },

  reorder: async (id: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/orders/${id}/reorder`);
  },

  checkout: async (request: {
    addressId: string;
    deliverySlotId: string;
    paymentMethod: string;
    couponCode?: string;
    notes?: string;
  }, idempotencyKey?: string): Promise<OrderDto> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient.post<ApiResponse<OrderDto>>('/checkout', request, { headers });
    return res.data.data;
  },
};
