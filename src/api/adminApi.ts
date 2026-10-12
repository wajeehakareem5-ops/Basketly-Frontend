import { apiClient } from './client';
import { ApiResponse, OrderDto, PageResponse, ProductDto, DeliverySlotDto } from '../types';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: OrderDto[];
}

export interface ProductPayload {
  name: string;
  categoryId: string;
  price: number;
  packageSize: string;
  unit: string;
  stockQuantity: number;
  isAvailable: boolean;
  organic: boolean;
  brand?: string;
  imageUrl?: string;
  description?: string;
  shelfLifeDays?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    return res.data.data;
  },

  getAllOrders: async (status?: string, page = 0, size = 15): Promise<PageResponse<OrderDto>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('size', size.toString());
    const res = await apiClient.get<ApiResponse<PageResponse<OrderDto>>>(`/admin/orders?${params.toString()}`);
    return res.data.data;
  },

  getOrderById: async (id: string): Promise<OrderDto> => {
    const res = await apiClient.get<ApiResponse<OrderDto>>(`/admin/orders/${id}`);
    return res.data.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<OrderDto> => {
    const res = await apiClient.patch<ApiResponse<OrderDto>>(`/admin/orders/${id}/status`, { status });
    return res.data.data;
  },

  createProduct: async (product: ProductPayload): Promise<ProductDto> => {
    const res = await apiClient.post<ApiResponse<ProductDto>>('/admin/products', product);
    return res.data.data;
  },

  updateProduct: async (id: string, product: ProductPayload): Promise<ProductDto> => {
    const res = await apiClient.put<ApiResponse<ProductDto>>(`/admin/products/${id}`, product);
    return res.data.data;
  },

  updateAvailability: async (id: string, isAvailable: boolean): Promise<ProductDto> => {
    const res = await apiClient.patch<ApiResponse<ProductDto>>(`/admin/products/${id}/availability`, { isAvailable });
    return res.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
  },

  getAllSlots: async (): Promise<DeliverySlotDto[]> => {
    const res = await apiClient.get<ApiResponse<DeliverySlotDto[]>>('/admin/delivery/slots');
    return res.data.data;
  },

  updateSlotCapacity: async (id: string, capacity: number): Promise<DeliverySlotDto> => {
    const res = await apiClient.patch<ApiResponse<DeliverySlotDto>>(`/admin/delivery/slots/${id}/capacity`, { capacity });
    return res.data.data;
  },

  createSlot: async (slot: { slotDate: string; startTime: string; endTime: string; capacity: number }): Promise<DeliverySlotDto> => {
    const res = await apiClient.post<ApiResponse<DeliverySlotDto>>('/admin/delivery/slots', slot);
    return res.data.data;
  },
};
