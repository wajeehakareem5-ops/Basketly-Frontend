import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShoppingBag,
  RotateCcw,
  Ban,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderDto } from '../../types';

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { refreshCart } = useCart();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(0);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: () => orderApi.getOrders(statusFilter || undefined, page, 10),
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      toast.success('Order cancelled and delivery slot capacity released');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.reorder(orderId),
    onSuccess: () => {
      toast.success('Items added back to your basket!');
      refreshCart();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reorder items');
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'CONFIRMED':
        return 'lime';
      case 'CANCELLED':
        return 'error';
      case 'PENDING':
      default:
        return 'warning';
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
            <h2 className="text-lg font-extrabold text-text-primary">My Orders & History</h2>
            <p className="text-xs text-text-secondary">
              Track live deliveries, cancel active slots, or reorder previous meal baskets
            </p>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
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

      {/* Orders List */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="You haven't placed any orders matching this status yet."
          actionText="Browse Groceries"
          onAction={() => (window.location.href = '/catalog')}
        />
      ) : (
        <div className="space-y-4">
          {pageData.content.map((order: OrderDto) => {
            const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-card hover:border-forest/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-text-primary">
                      {order.orderNumber}
                    </span>
                    <Badge variant={getStatusVariant(order.status) as any}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-forest" />
                      Delivery: <strong>{order.deliveryDate}</strong> ({order.slot?.startTime} - {order.slot?.endTime})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-forest" />
                      {order.address?.city || 'Bengaluru'}
                    </span>
                    <span>
                      {order.items?.length || 0} items
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-right">
                    <div className="text-base font-black text-forest">
                      ₹{order.totalAmount?.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-text-secondary uppercase">
                      {order.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-sage-muted hover:bg-sage border border-border text-xs font-bold text-text-primary transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-forest" />
                      <span>Details</span>
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancelOrderMutation.isPending}
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order? Delivery slot capacity will be released.')) {
                            cancelOrderMutation.mutate(order.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-state-error transition"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={reorderMutation.isPending}
                      onClick={() => reorderMutation.mutate(order.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-subtle transition active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-lime" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pageData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-40"
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
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
