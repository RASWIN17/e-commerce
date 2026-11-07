'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../lib/cart-context';

export default function CartDrawer() {
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
    subtotalPaise,
    totalCount,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const freeShippingThresholdPaise = 99900;
  const remainingForFreeShippingPaise = Math.max(0, freeShippingThresholdPaise - subtotalPaise);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F7F6F2] shadow-xl flex flex-col border-l border-[#E8E5DF]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E5DF] flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide text-[#171717]">
              Shopping Bag ({totalCount})
            </h2>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 text-[#77736C] hover:text-[#171717] focus:outline-none"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#EFECE6] px-6 py-2.5 text-xs text-[#171717]">
            {remainingForFreeShippingPaise === 0 ? (
              <p className="font-medium text-emerald-800">
                ✓ You have qualified for Free Express Shipping!
              </p>
            ) : (
              <p>
                Add <span className="font-semibold">₹{(remainingForFreeShippingPaise / 100).toFixed(0)}</span> more to unlock <span className="font-semibold">Free Express Shipping</span>
              </p>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-sm text-[#77736C]">Your shopping bag is empty.</p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="inline-block bg-[#171717] text-white text-xs uppercase tracking-wider px-6 py-3 font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant.id} className="flex gap-4 pb-6 border-b border-[#E8E5DF] last:border-b-0">
                  <div className="relative w-20 h-24 bg-[#EFECE6] flex-shrink-0 rounded-sm overflow-hidden">
                    <Image
                      src={item.product.images[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-sm font-medium text-[#171717] hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variant.id)}
                          className="text-[#77736C] hover:text-rose-600 p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#77736C] mt-0.5">
                        {item.variant.color_name} • Size {item.variant.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#D5D1C8] rounded-sm bg-white">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="p-1 px-2 text-[#171717] hover:bg-[#EFECE6]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium px-2 min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="p-1 px-2 text-[#171717] hover:bg-[#EFECE6]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-[#171717]">
                        ₹{((item.variant.price_paise * item.quantity) / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E5DF] bg-[#F7F6F2] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#77736C]">Subtotal</span>
                <span className="text-base font-semibold text-[#171717]">
                  ₹{(subtotalPaise / 100).toFixed(0)}
                </span>
              </div>
              <p className="text-[11px] text-[#77736C]">
                Taxes calculated at checkout. Free shipping on orders ₹999+.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-[#171717] text-white text-xs uppercase tracking-widest font-semibold py-3.5 flex items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full text-center block text-xs text-[#171717] hover:underline py-1.5"
                >
                  View Full Bag & Apply Coupons
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

