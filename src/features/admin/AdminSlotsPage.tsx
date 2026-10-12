import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Truck,
  Plus,
  Clock,
  Calendar,
  Users,
  Check,
  Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DeliverySlotDto } from '../../types';

export const AdminSlotsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00:00');
  const [newEndTime, setNewEndTime] = useState('11:00:00');
  const [newCapacity, setNewCapacity] = useState(15);

  const { data: slots, isLoading } = useQuery({
    queryKey: ['adminAllSlots'],
    queryFn: () => adminApi.getAllSlots(),
  });

  const updateCapacityMutation = useMutation({
    mutationFn: ({ id, capacity }: { id: string; capacity: number }) =>
      adminApi.updateSlotCapacity(id, capacity),
    onSuccess: () => {
      toast.success('Slot capacity updated!');
      queryClient.invalidateQueries({ queryKey: ['adminAllSlots'] });
      queryClient.invalidateQueries({ queryKey: ['deliverySlots'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update capacity');
    },
  });

  const createSlotMutation = useMutation({
    mutationFn: () =>
      adminApi.createSlot({
        slotDate: newSlotDate,
        startTime: newStartTime,
        endTime: newEndTime,
        capacity: newCapacity,
      }),
    onSuccess: () => {
      toast.success('New delivery slot created!');
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ['adminAllSlots'] });
      queryClient.invalidateQueries({ queryKey: ['deliverySlots'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Delivery Capacity & Windows</h2>
            <p className="text-xs text-text-secondary">
              Configure maximum reservation capacity and manage scheduled dispatch windows
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-card transition"
        >
          <Plus className="w-4 h-4 text-lime" />
          <span>Add Delivery Window</span>
        </button>
      </div>

      {/* Slots Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : !slots || slots.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-border text-xs text-text-secondary">
          No delivery windows configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slots.map((slot: DeliverySlotDto) => {
            const isFull = slot.bookedCount >= slot.capacity;
            const percent = Math.min(100, Math.round((slot.bookedCount / slot.capacity) * 100));

            return (
              <div
                key={slot.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-card space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-extrabold text-xs text-text-primary">{slot.slotDate}</span>
                  {isFull ? (
                    <Badge variant="error" size="sm">Full</Badge>
                  ) : (
                    <Badge variant="lime" size="sm">Available</Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  <span className="font-bold text-text-primary">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                {/* Capacity Progress */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-text-secondary">Booked:</span>
                    <span>
                      {slot.bookedCount} / {slot.capacity} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-sage-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percent >= 100 ? 'bg-state-error' : percent > 75 ? 'bg-state-warning' : 'bg-forest'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Capacity Adjuster */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-text-secondary">Max Capacity:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={slot.capacity <= 1 || updateCapacityMutation.isPending}
                      onClick={() =>
                        updateCapacityMutation.mutate({
                          id: slot.id,
                          capacity: Math.max(1, slot.capacity - 1),
                        })
                      }
                      className="w-6 h-6 rounded bg-sage-muted hover:bg-sage font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{slot.capacity}</span>
                    <button
                      type="button"
                      disabled={updateCapacityMutation.isPending}
                      onClick={() =>
                        updateCapacityMutation.mutate({
                          id: slot.id,
                          capacity: slot.capacity + 1,
                        })
                      }
                      className="w-6 h-6 rounded bg-sage-muted hover:bg-sage font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Delivery Slot Window"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Slot Date
              </label>
              <input
                type="date"
                required
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Order Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 font-bold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createSlotMutation.isPending}
                onClick={() => createSlotMutation.mutate()}
                className="px-5 py-2.5 bg-forest hover:bg-forest-deep text-white font-bold rounded-xl shadow-card transition"
              >
                Create Slot
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
