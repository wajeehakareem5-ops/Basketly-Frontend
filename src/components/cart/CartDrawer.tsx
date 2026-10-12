import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Tag, Check, Trash2, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QuantityStepper } from '../common/QuantityStepper';
import { EmptyState } from '../common/EmptyState';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    isLoading,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(code.trim().toUpperCase());
      setCouponInput('');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const subtotal = cart?.subtotal || 0;
  const freeDeliveryThreshold = 500;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card shadow-2xl flex flex-col border-l border-border animate-slide-left">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-sage-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-forest" />
              <h2 className="text-base font-bold text-text-primary">Your Basket</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest text-white">
                {cart?.items?.length || 0} items
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-sage-muted transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Tracker */}
          {cart && cart.items.length > 0 && (
            <div className="px-6 py-3 bg-sage border-b border-border text-xs">
              <div className="flex items-center justify-between font-semibold text-text-primary mb-1.5">
                <span className="flex items-center gap-1.5 text-forest">
                  <Truck className="w-4 h-4 text-forest" />
                  {amountToFreeDelivery === 0 ? (
                    <span className="text-state-success font-bold">🎉 You unlocked FREE Delivery!</span>
                  ) : (
                    <span>Add ₹{amountToFreeDelivery.toFixed(2)} for FREE Delivery</span>
                  )}
                </span>
                <span className="text-text-secondary font-medium">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-lime-dark transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Body: Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Your basket is empty"
                description="Explore fresh fruits, vegetables, and pantry essentials to fill your weekly plan."
                actionText="Browse Groceries"
                onAction={() => {
                  closeCart();
                  navigate('/catalog');
                }}
              />
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-sage-light/60 border border-border rounded-2xl gap-3 hover:border-forest/20 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-sage-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        {(item.product?.imageUrl || item.imageUrl) ? (
                          <img
                            src={item.product?.imageUrl || item.imageUrl}
                            alt={item.product?.name || item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">🥦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text-primary truncate">
                          {item.product?.name || item.productName}
                        </div>
                        <div className="text-xs text-text-secondary">
                          ₹{item.unitPrice.toFixed(2)} • {item.product?.unit || item.unit || 'unit'}
                        </div>
                        <div className="text-xs font-semibold text-forest mt-0.5">
                          Line: ₹{item.lineTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <QuantityStepper
                        value={item.quantity}
                        min={1}
                        size="sm"
                        disabled={isLoading}
                        onChange={(newQty) => updateQuantity(item.id, newQty)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        aria-label="Remove item"
                        className="p-1 rounded-lg text-text-secondary hover:text-state-error transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Coupon & Summary */}
          {cart && cart.items.length > 0 && (
            <div className="p-6 border-t border-border bg-card space-y-4 shadow-elevated">
              {/* Coupon Section */}
              <div>
                {(cart.appliedCouponCode || cart.appliedCoupon) ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-state-success font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Coupon &quot;{cart.appliedCouponCode || cart.appliedCoupon?.code}&quot; applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-state-error hover:underline text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl border border-border text-xs focus:outline-none focus:ring-2 focus:ring-forest bg-sage-light"
                      />
                      <button
                        type="button"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-semibold disabled:opacity-50 transition"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                      <Tag className="w-3 h-3" />
                      <span>Try:</span>
                      {['WELCOME50', 'SAVE10', 'FREEDEL'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleApplyCoupon(c)}
                          className="px-1.5 py-0.5 rounded bg-sage-muted hover:bg-sage border border-border font-mono font-bold text-forest"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-text-secondary border-t border-border pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">₹{cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-state-success font-semibold">
                    <span>Discount</span>
                    <span>-₹{cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
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
                <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-forest text-base">₹{(cart.totalAmount ?? cart.total)?.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-sm font-bold shadow-card transition active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-lime" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
