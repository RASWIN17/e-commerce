'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart-context';
import { calculateDeliveryEstimate } from '../../lib/delivery/calculator';
import { ShieldCheck, Truck, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    subtotalPaise,
    discountPaise,
    shippingFeePaise,
    totalPaise,
    couponCode,
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const est = calculateDeliveryEstimate(val, false, subtotalPaise);
      setDeliveryInfo(est);
      if (est.is_serviceable && !city) {
        setCity(est.city);
        setState(est.state);
      }
    } else {
      setDeliveryInfo(null);
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (pincode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          productSlug: i.product.slug,
          variantId: i.variant.id,
          quantity: i.quantity,
        })),
        shippingAddress: {
          full_name: fullName,
          phone,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          postal_code: pincode,
          country: 'India',
        },
        couponCode: couponCode || undefined,
        userEmail: email,
        userPhone: phone,
      };

      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Check if Cashfree production / sandbox SDK is used or simulation
      // If Cashfree session is created:
      clearCart();

      // Redirect to tracking page simulating confirmed payment in demo or real Cashfree checkout
      router.push(`/orders/${data.orderNumber}/track?session_id=${data.paymentSessionId}&status=confirmed`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong processing payment');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#171717]">No items in your bag to checkout</h1>
        <Link
          href="/shop"
          className="inline-block bg-[#171717] text-white px-6 py-3 text-xs uppercase tracking-wider font-semibold rounded-sm"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
          Secure Checkout
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[#77736C]">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-sm flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Delivery Details Form */}
        <div className="lg:col-span-7 bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#171717] pb-3 border-b border-[#E8E5DF]">
            1. Shipping & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Mobile Number * (for Delivery Updates)
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Email Address * (for Tax Invoice)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@gmail.com"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Flat, House no., Building, Apartment *
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Flat / House / Floor / Landmark"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Area, Street, Sector, Village (Optional)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Street / Colony"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                PIN Code * (6 digits)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={handlePincodeChange}
                placeholder="e.g. 560001"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                City / Town *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Country
              </label>
              <input
                type="text"
                disabled
                value="India"
                className="w-full bg-[#EFECE6] border border-[#D5D1C8] px-3.5 py-2.5 text-xs text-[#77736C] rounded-sm"
              />
            </div>
          </div>

          {/* Delivery Window Preview */}
          {deliveryInfo && deliveryInfo.is_serviceable && (
            <div className="bg-[#EFECE6] p-4 rounded-sm flex items-start gap-3 text-xs text-[#171717]">
              <Truck className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">
                  Estimated Arrival: {deliveryInfo.estimated_delivery_start} – {deliveryInfo.estimated_delivery_end}
                </p>
                <p className="text-[#77736C] text-[11px] mt-0.5">
                  Order will be custom-printed at our Tirupur facility and expedited via Express logistics.
                </p>
              </div>
            </div>
          )}

          {/* Payment Method Notice */}
          <div className="pt-4 border-t border-[#E8E5DF] space-y-3">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
              2. Payment Method
            </h2>
            <div className="border border-[#171717] p-4 rounded-sm bg-[#F7F6F2] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#171717]">
                  Cashfree Payment Gateway (UPI, GPay, Cards, NetBanking)
                </span>
                <p className="text-[11px] text-[#77736C]">
                  Official seamless payment processing with instant confirmation and automated print queue.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Action */}
        <div className="lg:col-span-5 bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-6">
          <h2 className="text-base font-bold tracking-tight text-[#171717]">
            Items in Order ({items.length})
          </h2>

          <div className="divide-y divide-[#E8E5DF] max-h-64 overflow-y-auto pr-1 text-xs">
            {items.map((item) => (
              <div key={item.variant.id} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#171717]">{item.product.name}</p>
                  <p className="text-[#77736C]">
                    Qty: {item.quantity} • {item.variant.color_name} • {item.variant.size}
                  </p>
                </div>
                <span className="font-medium text-[#171717]">
                  ₹{((item.variant.price_paise * item.quantity) / 100).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E8E5DF] pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-[#77736C]">
              <span>Subtotal</span>
              <span className="text-[#171717] font-medium">₹{(subtotalPaise / 100).toFixed(0)}</span>
            </div>

            {discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({couponCode})</span>
                <span>-₹{(discountPaise / 100).toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#77736C]">
              <span>Express Shipping</span>
              <span className="text-[#171717] font-medium">
                {shippingFeePaise === 0 ? 'FREE' : `₹${(shippingFeePaise / 100).toFixed(0)}`}
              </span>
            </div>

            <div className="border-t border-[#E8E5DF] pt-3 flex justify-between text-base font-bold text-[#171717]">
              <span>Total Payable</span>
              <span>₹{(totalPaise / 100).toFixed(0)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#171717] text-white py-3.5 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors rounded-sm shadow-sm"
          >
            <span>{loading ? 'Securing Payment Session...' : `Pay ₹${(totalPaise / 100).toFixed(0)} via Cashfree`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-[#77736C] leading-normal">
            By clicking Pay, you agree to IMAGIX&apos;s <Link href="/terms" className="underline">Terms</Link> and <Link href="/returns" className="underline">Return & Replacement Policy</Link>.
          </p>
        </div>
      </form>
    </div>
  );
}

