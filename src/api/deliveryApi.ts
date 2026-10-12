import { apiClient } from './client';
import { ApiResponse, DeliverySlotDto, ReservationDto } from '../types';

export const deliveryApi = {
  getSlots: async (startDate?: string, endDate?: string): Promise<DeliverySlotDto[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await apiClient.get<ApiResponse<DeliverySlotDto[]>>(`/delivery/slots?${params.toString()}`);
    return res.data.data;
  },

  getSchedule: async (): Promise<ReservationDto[]> => {
    const res = await apiClient.get<ApiResponse<ReservationDto[]>>('/delivery/schedule');
    return res.data.data;
  },

  createReservation: async (slotId: string, notes?: string): Promise<ReservationDto> => {
    const res = await apiClient.post<ApiResponse<ReservationDto>>('/delivery/slots/reservations', {
      slotId,
      notes,
    });
    return res.data.data;
  },

  rescheduleReservation: async (id: string, newSlotId: string): Promise<ReservationDto> => {
    const res = await apiClient.patch<ApiResponse<ReservationDto>>(`/delivery/reservations/${id}`, {
      slotId: newSlotId,
    });
    return res.data.data;
  },

  cancelReservation: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/delivery/reservations/${id}`);
  },
};
