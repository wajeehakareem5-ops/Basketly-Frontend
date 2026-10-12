import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  Ban,
  RotateCcw,
  Truck,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshCart } = useCart();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => (id ? orderApi.getOrderById(id) : Promise.reject('No id')),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => (id ? orderApi.cancelOrder(id) : Promise.reject()),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: () => (id ? orderApi.reorder(id) : Promise.reject()),
    onSuccess: () => {
      toast.success('Items added to basket!');
      refreshCart();
      navigate('/checkout');
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" count={2} />;
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <h3 className="text-base font-bold text-text-primary mb-2">Order Not Found</h3>
        <Link to="/orders" className="text-xs font-bold text-forest hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  // Lifecycle steps
  const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              type="button"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (confirm('Cancel this order and release delivery slot?')) {
                  cancelMutation.mutate();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-state-error transition"
            >
              Cancel Order
            </button>
          )}

          <button
            type="button"
            disabled={reorderMutation.isPending}
            onClick={() => reorderMutation.mutate()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-card transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-lime" />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
          <div>
            <span className="text-xs font-bold text-text-secondary uppercase">Order Summary</span>
            <h2 className="text-xl font-black text-text-primary mt-0.5">{order.orderNumber}</h2>
          </div>
          <Badge
            variant={
              order.status === 'DELIVERED'
                ? 'success'
                : order.status === 'CANCELLED'
                ? 'error'
                : 'lime'
            }
          >
            {order.status}
          </Badge>
        </div>

        {/* Order Lifecycle Progress */}
        {!isCancelled ? (
          <div className="py-2">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                return (
                  <div key={st} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-forest' : 'bg-sage-muted'
                      }`}
                    />
                    <span
                      className={`font-bold block text-[11px] ${
                        isPassed ? 'text-forest' : 'text-text-secondary'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-state-error font-semibold flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0" />
            <span>This order was cancelled and the reserved slot capacity was released.</span>
          </div>
        )}

        {/* Slot & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-sage-light rounded-xl border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-forest font-bold mb-1">
              <Truck className="w-4 h-4" />
              <span>Delivery Slot</span>
            </div>
            <div>Date: <strong className="text-text-primary">{order.deliveryDate}</strong></div>
            <div>
              Window: <strong className="text-text-primary">{order.slot?.startTime} - {order.slot?.endTime}</strong>
            </div>
            {order.deliveryNotes && (
              <div className="pt-1 text-text-secondary italic">Note: &quot;{order.deliveryNotes}&quot;</div>
            )}
          </div>

          <div className="p-4 bg-sage-light rounded-xl border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-forest font-bold mb-1">
              <MapPin className="w-4 h-4" />
              <span>Delivery Address</span>
            </div>
            <div className="font-bold text-text-primary">{order.address?.recipientName} ({order.address?.label})</div>
            <div className="text-text-secondary">{order.address?.street}, {order.address?.city}</div>
            <div className="text-text-secondary">Phone: {order.address?.phone}</div>
          </div>
        </div>

        {/* Items Snapshot Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Order Items ({order.items?.length || 0})
          </h3>
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
            {order.items?.map((item: any) => (
              <div key={item.id} className="p-3 bg-white flex items-center justify-between text-xs">
                <div className="min-w-0 pr-4">
                  <div className="font-bold text-text-primary truncate">{item.productName}</div>
                  <div className="text-[11px] text-text-secondary">
                    {item.quantity} × ₹{item.unitPrice.toFixed(2)} / {item.unit}
                  </div>
                </div>
                <div className="font-black text-forest text-sm">
                  ₹{item.lineTotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-border space-y-2 text-xs text-text-secondary max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-text-primary">₹{order.subtotal?.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-state-success font-semibold">
              <span>Discount ({order.couponCode})</span>
              <span>-₹{order.discountAmount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-text-primary">
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee?.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="font-bold text-text-primary">₹{order.taxAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-text-primary pt-2 border-t border-border">
            <span>Total Amount</span>
            <span className="text-forest">₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
