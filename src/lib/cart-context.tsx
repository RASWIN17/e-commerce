'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductVariant } from './types';

export interface CartItemType {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItemType[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountPaise: number;
  subtotalPaise: number;
  shippingFeePaise: number;
  gstPaise: number;
  totalPaise: number;
  totalCount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPaise, setDiscountPaise] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('imagix_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('imagix_coupon');
      if (savedCoupon) {
        setCouponCode(savedCoupon);
      }
    } catch (e) {
      console.error('Error loading cart', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('imagix_cart', JSON.stringify(items));
      if (couponCode) {
        localStorage.setItem('imagix_coupon', couponCode);
      } else {
        localStorage.removeItem('imagix_coupon');
      }
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }, [items, couponCode, isInitialized]);

  const subtotalPaise = items.reduce(
    (acc, item) => acc + item.variant.price_paise * item.quantity,
    0
  );

  // Free shipping on orders >= ₹999 (99900 paise)
  const shippingFeePaise = subtotalPaise >= 99900 || subtotalPaise === 0 ? 0 : 9900;

  // Approximate 5% GST included in retail pricing
  const gstPaise = Math.round((subtotalPaise * 5) / 105);

  const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingFeePaise);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variant.id === variant.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, variant, quantity }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variant.id === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountPaise(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FIRST10') {
      const discount = Math.round(subtotalPaise * 0.1);
      setDiscountPaise(discount);
      setCouponCode(clean);
      return { success: true, message: 'Coupon FIRST10 applied! 10% off' };
    } else if (clean === 'IMAGIX100') {
      if (subtotalPaise < 99900) {
        return { success: false, message: 'Minimum order of ₹999 required for IMAGIX100' };
      }
      setDiscountPaise(10000); // ₹100
      setCouponCode(clean);
      return { success: true, message: 'Coupon IMAGIX100 applied! ₹100 off' };
    }
    return { success: false, message: 'Invalid or expired coupon code' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPaise(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        couponCode,
        applyCoupon,
        removeCoupon,
        discountPaise,
        subtotalPaise,
        shippingFeePaise,
        gstPaise,
        totalPaise,
        totalCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

