import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShoppingBag,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderDto } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['adminAllOrders', statusFilter, page],
    queryFn: () => adminApi.getAllOrders(statusFilter || undefined, page, 15),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Order ${updated.orderNumber} updated to ${updated.status}`);
      if (selectedOrder && selectedOrder.id === updated.id) {
        setSelectedOrder(updated);
      }
      queryClient.invalidateQueries({ queryKey: ['adminAllOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });

  const statuses = [
    '',
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success">{status}</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">{status}</Badge>;
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_DELIVERY':
      case 'CONFIRMED':
        return <Badge variant="lime">{status}</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Fulfillment & Order Queue</h2>
            <p className="text-xs text-text-secondary">
              Review and advance fulfillment lifecycle across all user orders
            </p>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-forest text-white shadow-subtle'
                  : 'bg-sage-muted text-text-primary hover:bg-sage'
              }`}
            >
              {st === '' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="There are currently no customer orders matching this status filter."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sage-light text-text-secondary uppercase text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Delivery Date & Window</th>
                  <th className="px-5 py-3">Customer / Address</th>
                  <th className="px-5 py-3">Total (₹)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Update Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageData.content.map((ord: OrderDto) => (
                  <tr key={ord.id} className="hover:bg-sage-light/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-text-primary text-sm">
                        {ord.orderNumber}
                      </div>
                      <span className="text-[10px] text-text-secondary">
                        {ord.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-text-primary">{ord.deliveryDate}</div>
                      <div className="text-[11px] text-text-secondary">
                        {ord.deliverySlot || 'Morning window'}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-text-secondary">
                      {ord.shippingAddress || 'Standard Delivery'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-forest text-sm">
                        ₹{ord.totalAmount?.toFixed(2)}
                      </span>
                      <div className="text-[10px] text-text-secondary uppercase">
                        {ord.paymentMethod}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(ord.status)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: ord.id, status: e.target.value })
                        }
                        className="px-2.5 py-1.5 bg-sage-light border border-border rounded-xl text-xs font-bold focus:ring-forest"
                      >
                        {statuses
                          .filter((s) => s !== '')
                          .map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sage-muted hover:bg-sage text-forest text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-text-secondary px-2">
                Page {page + 1} of {pageData.totalPages}
              </span>
              <button
                type="button"
                disabled={page + 1 >= pageData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.orderNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div>
                <span className="text-text-secondary">Fulfillment Status: </span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <span className="font-bold text-forest text-base">
                Total: ₹{selectedOrder.totalAmount?.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-sage-light rounded-xl border border-border space-y-1">
              <div className="font-bold text-text-primary">Delivery Information</div>
              <div className="text-text-secondary">
                Date & Slot: {selectedOrder.deliveryDate} ({selectedOrder.deliverySlot})
              </div>
              <div className="text-text-secondary">
                Address: {selectedOrder.shippingAddress}
              </div>
              {selectedOrder.instructions && (
                <div className="text-forest italic">Notes: &quot;{selectedOrder.instructions}&quot;</div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Order Items ({selectedOrder.items?.length || 0})
              </div>
              <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="p-2.5 flex justify-between items-center bg-white">
                    <div>
                      <div className="font-bold text-text-primary">{it.productName}</div>
                      <div className="text-[10px] text-text-secondary">
                        {it.quantity} × ₹{it.unitPrice.toFixed(2)} ({it.unit})
                      </div>
                    </div>
                    <span className="font-bold text-forest">₹{it.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-sage-muted hover:bg-sage rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
