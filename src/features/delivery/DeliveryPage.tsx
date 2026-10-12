import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../../api/deliveryApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Trash2,
  Repeat,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DeliverySlotDto, ReservationDto } from '../../types';

export const DeliveryPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [selectedSlotForReserve, setSelectedSlotForReserve] = useState<DeliverySlotDto | null>(null);
  const [reserveNotes, setReserveNotes] = useState<string>('');
  const [reservationToReschedule, setReservationToReschedule] = useState<ReservationDto | null>(null);
  const [newSlotIdForReschedule, setNewSlotIdForReschedule] = useState<string>('');

  // Fetch 14-day slots
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['deliverySlots'],
    queryFn: () => deliveryApi.getSlots(),
  });

  // Fetch user reservations schedule
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['deliverySchedule'],
    queryFn: () => deliveryApi.getSchedule(),
  });

  // Mutations
  const reserveMutation = useMutation({
    mutationFn: (data: { slotId: string; notes?: string }) =>
      deliveryApi.createReservation(data.slotId, data.notes),
    onSuccess: () => {
      toast.success('Delivery slot reserved successfully!');
      setSelectedSlotForReserve(null);
      setReserveNotes('');
      queryClient.invalidateQueries({ queryKey: ['deliverySlots'] });
      queryClient.invalidateQueries({ queryKey: ['deliverySchedule'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Slot is full or reservation failed');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (data: { reservationId: string; newSlotId: string }) =>
      deliveryApi.rescheduleReservation(data.reservationId, data.newSlotId),
    onSuccess: () => {
      toast.success('Reservation rescheduled successfully!');
      setReservationToReschedule(null);
      setNewSlotIdForReschedule('');
      queryClient.invalidateQueries({ queryKey: ['deliverySlots'] });
      queryClient.invalidateQueries({ queryKey: ['deliverySchedule'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Rescheduling failed');
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (id: string) => deliveryApi.cancelReservation(id),
    onSuccess: () => {
      toast.success('Reservation cancelled and slot capacity released');
      queryClient.invalidateQueries({ queryKey: ['deliverySlots'] });
      queryClient.invalidateQueries({ queryKey: ['deliverySchedule'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    },
  });

  // Group slots by date
  const slotsByDate: Record<string, DeliverySlotDto[]> = {};
  slots?.forEach((slot) => {
    if (!slotsByDate[slot.slotDate]) {
      slotsByDate[slot.slotDate] = [];
    }
    slotsByDate[slot.slotDate].push(slot);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">Delivery Schedule & Slots</h2>
          <p className="text-xs text-text-secondary">
            Manage your scheduled weekly kitchen drops and reserve convenient morning or evening delivery slots
          </p>
        </div>
      </div>

      {/* User's Current Reserved Slots */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <CalendarDays className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-text-primary">Your Active Slot Reservations</h3>
        </div>

        {scheduleLoading ? (
          <LoadingSkeleton type="line" count={2} />
        ) : !schedule || schedule.length === 0 ? (
          <p className="text-xs text-text-secondary py-2">
            You don&apos;t have any standalone slots reserved. Pick a time window below to reserve for your upcoming grocery drop.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {schedule.map((res: ReservationDto) => (
              <div
                key={res.id}
                className="p-4 bg-sage-light border border-border rounded-xl space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-text-primary">
                    {res.slot?.slotDate}
                  </span>
                  <Badge variant="lime" size="sm">{res.status}</Badge>
                </div>

                <div className="text-text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  <span>{res.slot?.startTime} - {res.slot?.endTime}</span>
                </div>

                {res.notes && (
                  <div className="text-[11px] text-text-secondary italic">Note: &quot;{res.notes}&quot;</div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setReservationToReschedule(res);
                      setNewSlotIdForReschedule('');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-card hover:bg-sage border border-border text-forest text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cancelReservationMutation.mutate(res.id)}
                    className="p-1 rounded-lg text-text-secondary hover:text-state-error transition"
                    title="Cancel reservation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 14-Day Slots Calendar Grid */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Calendar className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-text-primary">14-Day Delivery Slot Availability</h3>
        </div>

        {slotsLoading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(slotsByDate).map(([dateStr, dateSlots]) => (
              <div
                key={dateStr}
                className="p-4 bg-sage-light/50 border border-border rounded-xl space-y-3"
              >
                <div className="font-extrabold text-xs text-text-primary pb-2 border-b border-border flex justify-between">
                  <span>{dateStr}</span>
                  <span className="text-[10px] text-text-secondary font-medium">
                    {dateSlots.length} windows
                  </span>
                </div>

                <div className="space-y-2">
                  {dateSlots.map((slot) => {
                    const isAvailable = slot.bookedCount < slot.capacity;
                    const seatsLeft = slot.capacity - slot.bookedCount;

                    return (
                      <div
                        key={slot.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isAvailable
                            ? 'bg-white border-border hover:border-forest/30'
                            : 'bg-sage-muted border-border opacity-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-text-primary">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-[10px] text-text-secondary">
                            {isAvailable ? `${seatsLeft} slots left` : 'Fully Booked'}
                          </div>
                        </div>

                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => setSelectedSlotForReserve(slot)}
                            className="px-2 py-1 bg-forest hover:bg-forest-deep text-white font-bold text-[10px] rounded-lg transition"
                          >
                            Reserve
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reserve Slot Modal */}
      {selectedSlotForReserve && (
        <Modal
          isOpen={!!selectedSlotForReserve}
          onClose={() => setSelectedSlotForReserve(null)}
          title="Reserve Delivery Slot"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-sage-light rounded-xl border border-border">
              <div>Date: <strong className="text-text-primary">{selectedSlotForReserve.slotDate}</strong></div>
              <div>
                Time Window: <strong className="text-text-primary">{selectedSlotForReserve.startTime} - {selectedSlotForReserve.endTime}</strong>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Drop Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave outside door"
                value={reserveNotes}
                onChange={(e) => setReserveNotes(e.target.value)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSlotForReserve(null)}
                className="px-3 py-2 font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reserveMutation.isPending}
                onClick={() =>
                  reserveMutation.mutate({
                    slotId: selectedSlotForReserve.id,
                    notes: reserveNotes,
                  })
                }
                className="px-4 py-2 bg-forest hover:bg-forest-deep text-white font-bold rounded-xl shadow-card transition"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Slot Modal */}
      {reservationToReschedule && (
        <Modal
          isOpen={!!reservationToReschedule}
          onClose={() => setReservationToReschedule(null)}
          title="Reschedule Delivery Slot"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Select an available time slot to move your delivery reservation to:
            </p>

            <div className="max-h-56 overflow-y-auto space-y-2">
              {slots
                ?.filter((s) => s.bookedCount < s.capacity && s.id !== reservationToReschedule.slot?.id)
                .map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setNewSlotIdForReschedule(slot.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${
                      newSlotIdForReschedule === slot.id
                        ? 'border-forest bg-forest/5 font-bold'
                        : 'border-border bg-white hover:bg-sage-light'
                    }`}
                  >
                    <span>{slot.slotDate} ({slot.startTime} - {slot.endTime})</span>
                    <span className="text-[10px] text-state-success font-semibold">
                      {slot.capacity - slot.bookedCount} left
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReservationToReschedule(null)}
                className="px-3 py-2 font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rescheduleMutation.isPending || !newSlotIdForReschedule}
                onClick={() =>
                  rescheduleMutation.mutate({
                    reservationId: reservationToReschedule.id,
                    newSlotId: newSlotIdForReschedule,
                  })
                }
                className="px-4 py-2 bg-forest hover:bg-forest-deep text-white font-bold rounded-xl shadow-card transition disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
