import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../../api/userApi';
import { deliveryApi } from '../../api/deliveryApi';
import { orderApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Badge } from '../../components/common/Badge';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Plus,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AddressDto, DeliverySlotDto, OrderDto } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  // Selected choices
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [placedOrder, setPlacedOrder] = useState<OrderDto | null>(null);

  // Idempotency key per page load
  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `basketly-order-${Date.now()}`
  );

  // Address form modal/inline
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    default: false,
    isDefault: false,
  });

  // Queries
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const list = await userApi.getAddresses();
      if (list.length > 0 && !selectedAddressId) {
        const def = list.find((a) => a.default) || list[0];
        setSelectedAddressId(def.id);
      }
      return list;
    },
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['deliverySlots'],
    queryFn: async () => {
      const list = await deliveryApi.getSlots();
      // Auto-select first available slot
      const available = list.find((s) => s.bookedCount < s.capacity);
      if (available && !selectedSlotId) {
        setSelectedSlotId(available.id);
      }
      return list;
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: (addr: typeof newAddress) => userApi.createAddress(addr),
    onSuccess: (saved) => {
      toast.success('Address saved');
      setShowNewAddressForm(false);
      refetchAddresses();
      setSelectedAddressId(saved.id);
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) throw new Error('Please select a delivery address');
      if (!selectedSlotId) throw new Error('Please select a delivery slot');
      return orderApi.checkout(
        {
          addressId: selectedAddressId,
          deliverySlotId: selectedSlotId,
          paymentMethod,
          couponCode: cart?.appliedCouponCode || cart?.appliedCoupon?.code,
          notes: deliveryNotes,
        },
        idempotencyKey
      );
    },
    onSuccess: (order) => {
      toast.success('Order placed successfully!');
      setPlacedOrder(order);
      refreshCart();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    },
  });

  // If order was successfully placed, show Confirmation screen
  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-elevated space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-state-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-state-success">
              Order Confirmed
            </span>
            <h2 className="text-2xl font-black text-text-primary mt-1">Thank you for your order!</h2>
            <p className="text-xs text-text-secondary mt-1">
              Order ID: <strong className="text-forest font-mono">{placedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="p-4 bg-sage-light rounded-2xl border border-border text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Delivery Date:</span>
              <strong className="text-text-primary">{placedOrder.deliveryDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Slot Window:</span>
              <strong className="text-text-primary">
                {placedOrder.slot?.startTime} - {placedOrder.slot?.endTime}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Payment Method:</span>
              <strong className="text-text-primary">{placedOrder.paymentMethod}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold">
              <span>Total Paid / Payable:</span>
              <span className="text-forest text-sm">₹{placedOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to={`/orders/${placedOrder.id}`}
              className="px-5 py-3 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-card transition"
            >
              View Order Details
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-xl bg-sage-muted hover:bg-sage border border-border text-forest text-xs font-bold transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card space-y-4">
          <ShoppingBag className="w-12 h-12 text-forest mx-auto" />
          <h2 className="text-lg font-bold text-text-primary">Your Basket is Empty</h2>
          <p className="text-xs text-text-secondary">
            Add items from your weekly meal plan or browse the grocery catalog.
          </p>
          <Link
            to="/catalog"
            className="inline-block px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-card"
          >
            Browse Groceries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-card p-6 rounded-2xl border border-border shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">Secure Checkout</h2>
          <p className="text-xs text-text-secondary">
            Review your delivery address, reserve a slot, and confirm your order
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-state-success font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Idempotent Transaction</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Address, Slot, Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest" />
                <h3 className="text-sm font-bold text-text-primary">1. Select Delivery Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses?.map((addr: AddressDto) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedAddressId === addr.id
                      ? 'border-forest bg-forest/5 ring-1 ring-forest'
                      : 'border-border bg-white hover:bg-sage-light'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-text-primary">{addr.label}</span>
                    {addr.default && <Badge variant="lime" size="sm">Default</Badge>}
                  </div>
                  <div className="text-xs text-text-secondary">{addr.recipientName} • {addr.phone}</div>
                  <div className="text-xs text-text-primary font-medium mt-1">
                    {addr.street}, {addr.city}, {addr.postalCode}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Form inline */}
            {showNewAddressForm && (
              <div className="p-4 bg-sage-light rounded-xl border border-border space-y-3 mt-3">
                <h4 className="text-xs font-bold text-text-primary uppercase">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Recipient Name"
                    value={newAddress.recipientName}
                    onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    className="px-3 py-2 bg-white border border-border rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (10 digits)"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="px-3 py-2 bg-white border border-border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Street Address, Building"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-3 py-2 bg-white border border-border rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="px-3 py-2 bg-white border border-border rounded-xl text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-3 py-1.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => addAddressMutation.mutate(newAddress)}
                    className="px-4 py-1.5 bg-forest text-white text-xs font-bold rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Delivery Slot Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Clock className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-text-primary">2. Reserve Delivery Slot</h3>
            </div>

            {slotsLoading ? (
              <LoadingSkeleton type="line" count={3} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {slots?.slice(0, 9).map((slot: DeliverySlotDto) => {
                  const isAvailable = slot.bookedCount < slot.capacity;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-xl border text-xs transition ${
                        !isAvailable
                          ? 'opacity-40 bg-sage-muted border-border cursor-not-allowed'
                          : isSelected
                          ? 'border-forest bg-forest/5 ring-1 ring-forest cursor-pointer font-bold'
                          : 'border-border bg-white hover:bg-sage-light cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-text-primary">{slot.slotDate}</span>
                        {isAvailable ? (
                          <span className="text-[10px] text-state-success font-semibold">
                            {slot.capacity - slot.bookedCount} left
                          </span>
                        ) : (
                          <span className="text-[10px] text-state-error font-semibold">Full</span>
                        )}
                      </div>
                      <div className="text-text-secondary">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Banknote className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-text-primary">3. Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'COD', label: 'Cash on Delivery', desc: 'Pay with cash upon delivery' },
                { id: 'UPI', label: 'UPI Simulator', desc: 'Instant UPI mock verification' },
                { id: 'CARD', label: 'Card Simulator', desc: 'Mock Credit/Debit Card' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-xs transition ${
                    paymentMethod === m.id
                      ? 'border-forest bg-forest/5 ring-1 ring-forest font-bold'
                      : 'border-border bg-white hover:bg-sage-light'
                  }`}
                >
                  <div className="font-extrabold text-text-primary mb-0.5">{m.label}</div>
                  <div className="text-text-secondary text-[11px]">{m.desc}</div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                Delivery Instructions (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with security guard, ring bell twice"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 bg-sage-light border border-border rounded-xl text-xs focus:ring-forest"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary & Place Order Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 sticky top-20">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border">
              Order Summary ({cart.items.length} items)
            </h3>

            {/* Item list snapshot */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-text-primary truncate">{item.product?.name || item.productName}</div>
                    <div className="text-[10px] text-text-secondary">
                      {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-bold text-forest shrink-0">
                    ₹{item.lineTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-border space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-text-primary">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-state-success font-semibold">
                  <span>Discount ({cart.appliedCouponCode || cart.appliedCoupon?.code})</span>
                  <span>-₹{cart.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-text-primary">
                  {cart.deliveryFee === 0 ? (
                    <span className="text-state-success font-bold">FREE</span>
                  ) : (
                    `₹${cart.deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-text-primary">₹{cart.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-text-primary pt-3 border-t border-border">
                <span>Total Amount</span>
                <span className="text-forest">₹{(cart.totalAmount ?? cart.total)?.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              disabled={checkoutMutation.isPending || !selectedAddressId || !selectedSlotId}
              onClick={() => checkoutMutation.mutate()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest hover:bg-forest-deep text-white font-bold text-sm rounded-xl shadow-card transition active:scale-98 disabled:opacity-50"
            >
              <span>{checkoutMutation.isPending ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4 text-lime" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
