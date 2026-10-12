import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeCoupon, setActiveCoupon] = useState<string | undefined>(undefined);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartApi.getCart(activeCoupon);
      setCart(data);
      if (data.appliedCoupon) {
        setActiveCoupon(data.appliedCoupon.code);
      }
    } catch {
      // Ignore cart loading error on initial start
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeCoupon]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    try {
      const updated = await cartApi.addItem(productId, quantity, activeCoupon);
      setCart(updated);
      toast.success('Added to basket');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add item to basket');
      throw err;
    }
  }, [activeCoupon]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        const updated = await cartApi.removeItem(itemId, activeCoupon);
        setCart(updated);
        toast.success('Item removed');
      } else {
        const updated = await cartApi.updateQuantity(itemId, quantity, activeCoupon);
        setCart(updated);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
      throw err;
    }
  }, [activeCoupon]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const updated = await cartApi.removeItem(itemId, activeCoupon);
      setCart(updated);
      toast.success('Item removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
      throw err;
    }
  }, [activeCoupon]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const updated = await cartApi.applyCoupon(code);
      setActiveCoupon(code);
      setCart(updated);
      toast.success(`Coupon "${code}" applied!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      throw err;
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      const updated = await cartApi.removeCoupon();
      setActiveCoupon(undefined);
      setCart(updated);
      toast.success('Coupon removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove coupon');
      throw err;
    }
  }, []);

  const itemCount = cart?.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        itemCount,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
