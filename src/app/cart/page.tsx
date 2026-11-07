'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../lib/cart-context';
import PincodeChecker from '../../components/PincodeChecker';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    couponCode,
    applyCoupon,
    removeCoupon,
    discountPaise,
    subtotalPaise,
    shippingFeePaise,
    gstPaise,
    totalPaise,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon) return;
    const res = applyCoupon(inputCoupon);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) setInputCoupon('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Your Bag is Empty</h1>
        <p className="text-sm text-[#77736C] max-w-sm mx-auto">
          Explore our collection of heavyweight oversized tees and everyday staples.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#171717] text-white text-xs uppercase tracking-widest font-semibold px-8 py-3.5 hover:bg-[#2A2A2A] transition-colors rounded-sm"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Cart items table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-t border-[#E8E5DF] divide-y divide-[#E8E5DF]">
            {items.map((item) => (
              <div key={item.variant.id} className="py-6 flex gap-4 sm:gap-6">
                <div className="relative w-24 h-32 bg-[#EFECE6] flex-shrink-0 rounded-sm overflow-hidden">
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
                        className="text-base font-semibold text-[#171717] hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.variant.id)}
                        className="text-[#77736C] hover:text-rose-600 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-[#77736C] mt-1">
                      {item.variant.color_name} • Size {item.variant.size}
                    </p>
                    <p className="text-xs text-[#77736C] mt-0.5">
                      SKU: {item.variant.sku}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-[#D5D1C8] bg-white rounded-sm">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="p-1 px-2.5 text-[#171717] hover:bg-[#EFECE6]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold px-2 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        className="p-1 px-2.5 text-[#171717] hover:bg-[#EFECE6]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-base font-bold text-[#171717]">
                      ₹{((item.variant.price_paise * item.quantity) / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery estimation tool */}
          <div className="pt-2">
            <PincodeChecker orderTotalPaise={subtotalPaise} />
          </div>
        </div>

        {/* Right Column: Order summary & Coupon */}
        <div className="lg:col-span-5 bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-6">
          <h2 className="text-lg font-bold tracking-tight text-[#171717]">Order Summary</h2>

          {/* Coupon Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Apply Promo Code</span>
            </label>

            {couponCode ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-sm text-xs">
                <span className="font-semibold text-emerald-800">
                  {couponCode} (₹{(discountPaise / 100).toFixed(0)} saved)
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  placeholder="e.g. FIRST10 or IMAGIX100"
                  className="flex-1 bg-[#F7F6F2] border border-[#D5D1C8] px-3 py-2 text-xs uppercase focus:outline-none focus:border-[#171717] rounded-sm"
                />
                <button
                  type="submit"
                  className="bg-[#171717] text-white px-4 py-2 text-xs uppercase font-medium hover:bg-[#2A2A2A] rounded-sm"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMessage && (
              <p className={`text-xs ${couponMessage.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="border-t border-[#E8E5DF] pt-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-[#77736C]">
              <span>Product Subtotal</span>
              <span className="font-medium text-[#171717]">₹{(subtotalPaise / 100).toFixed(0)}</span>
            </div>

            {discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({couponCode})</span>
                <span>-₹{(discountPaise / 100).toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#77736C]">
              <span>Estimated Express Delivery</span>
              <span className="font-medium text-[#171717]">
                {shippingFeePaise === 0 ? 'FREE' : `₹${(shippingFeePaise / 100).toFixed(0)}`}
              </span>
            </div>

            <div className="flex justify-between text-[#77736C]">
              <span>Applicable GST (5% included)</span>
              <span>₹{(gstPaise / 100).toFixed(0)}</span>
            </div>

            <div className="border-t border-[#E8E5DF] pt-3 flex justify-between text-base font-bold text-[#171717]">
              <span>Total Payable</span>
              <span>₹{(totalPaise / 100).toFixed(0)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-[#171717] text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors rounded-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#77736C]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Encrypted 256-bit payment secured by Cashfree Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

