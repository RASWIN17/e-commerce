'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ArrowLeft,
  FileText,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/payments/cashfree/verify?order_id=${encodeURIComponent(orderNumber)}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Order record not found');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Unable to load order status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Verifying payment gateway status and loading shipment tracking...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#171717]">Order Not Found</h1>
        <p className="text-xs text-[#77736C]">
          We could not find an order matching reference <strong className="text-[#171717]">#{orderNumber}</strong>. Please check your order confirmation email.
        </p>
        <div className="pt-2 flex justify-center gap-3 text-xs">
          <Link
            href="/shop"
            className="bg-[#171717] text-white px-5 py-2.5 uppercase tracking-wider font-semibold rounded-sm"
          >
            Return to Store
          </Link>
          <Link
            href="/contact"
            className="border border-[#D5D1C8] px-5 py-2.5 font-medium text-[#171717] rounded-sm hover:bg-[#F7F6F2]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  const status = order.status; // pending, confirmed, in_production, dispatched, delivered, cancelled
  const payment = order.payments?.[0];
  const fulfilment = order.fulfilment_jobs?.[0];
  const shipment = order.shipments?.[0];

  const isConfirmed = ['confirmed', 'in_production', 'dispatched', 'delivered'].includes(status);
  const isInProduction = ['in_production', 'dispatched', 'delivered'].includes(status);
  const isDispatched = ['dispatched', 'delivered'].includes(status);
  const isDelivered = status === 'delivered';

  const timelineSteps = [
    {
      title: 'Order Placed',
      description: 'Order registered and item snapshots recorded.',
      completed: true,
      current: status === 'pending',
    },
    {
      title: 'Payment Verification',
      description: isConfirmed
        ? 'Payment authenticated and confirmed by Cashfree.'
        : 'Awaiting payment confirmation from Cashfree gateway.',
      completed: isConfirmed,
      current: status === 'confirmed' && !isInProduction,
    },
    {
      title: 'Production & DTG Printing',
      description: isInProduction
        ? `Order transmitted to Qikink Tirupur Hub (ID: ${fulfilment?.qikink_order_id || 'Queued'}).`
        : 'Awaiting blank staging and DTG print execution.',
      completed: isInProduction,
      current: status === 'in_production',
    },
    {
      title: 'Courier Dispatch',
      description: isDispatched
        ? `Dispatched via ${shipment?.courier_name || 'Express Logistics'}. Tracking: ${shipment?.tracking_number || 'Generated'}`
        : 'Package will be handed over to courier upon inspection.',
      completed: isDispatched,
      current: status === 'dispatched',
    },
    {
      title: 'Delivered',
      description: isDelivered ? 'Delivered to shipping address.' : 'Expected at customer address.',
      completed: isDelivered,
      current: isDelivered,
    },
  ];

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-[#77736C] hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <button
          onClick={fetchOrderDetails}
          className="inline-flex items-center gap-1 text-xs text-[#77736C] hover:text-[#171717]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Order Status Header */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span
              className={`text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm ${
                isConfirmed ? 'text-emerald-800 bg-emerald-50' : 'text-amber-800 bg-amber-50'
              }`}
            >
              {isConfirmed ? 'Order Confirmed' : 'Payment Processing'}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] mt-2">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-[#77736C] mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintInvoice}
              className="inline-flex items-center gap-1.5 border border-[#D5D1C8] px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 border border-[#D5D1C8] px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need Help?</span>
            </Link>
          </div>
        </div>

        {/* Real Order Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <span className="text-[#77736C] block">Payment Gateway</span>
            <span className="font-semibold text-[#171717]">
              Cashfree ({payment?.payment_status || 'PENDING'})
            </span>
          </div>
          <div>
            <span className="text-[#77736C] block">Fulfilment Status</span>
            <span className="font-semibold text-[#171717]">
              {fulfilment?.status === 'submitted' ? 'Submitted to Qikink Hub' : fulfilment?.status || 'Staging'}
            </span>
          </div>
          <div>
            <span className="text-[#77736C] block">Estimated Delivery</span>
            <span className="font-semibold text-emerald-800">
              {order.delivery_estimate_date || 'Within 4-6 business days'}
            </span>
          </div>
        </div>
      </div>

      {/* Purchased Items Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717] border-b border-[#E8E5DF] pb-3">
          Order Items & Invoice Breakdown
        </h2>

        <div className="divide-y divide-[#E8E5DF] text-xs">
          {(order.order_items || []).map((it: any) => (
            <div key={it.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#171717]">{it.product_name}</p>
                <p className="text-[#77736C] text-[11px] mt-0.5">
                  {it.variant_name} • SKU: {it.sku} • Qty: {it.quantity}
                </p>
              </div>
              <span className="font-semibold text-[#171717]">
                ₹{((it.total_price_paise || 0) / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E8E5DF] pt-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-[#77736C]">
            <span>Subtotal</span>
            <span>₹{(order.subtotal_paise / 100).toFixed(2)}</span>
          </div>
          {order.discount_paise > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.coupon_code || 'PROMO'})</span>
              <span>-₹{(order.discount_paise / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#77736C]">
            <span>Shipping</span>
            <span>{order.shipping_fee_paise === 0 ? 'FREE' : `₹${(order.shipping_fee_paise / 100).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-[#171717] pt-2 border-t border-[#E8E5DF]">
            <span>Total Paid</span>
            <span>₹{(order.total_amount_paise / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <h2 className="text-sm font-bold tracking-tight text-[#171717] uppercase tracking-wider">
          Fulfilment Journey
        </h2>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E5DF]">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-[#171717] text-white'
                    : step.current
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-[#E8E5DF] text-[#77736C]'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={`text-xs font-semibold ${
                    step.current ? 'text-emerald-800' : 'text-[#171717]'
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-[#77736C] mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address Snapshot */}
      {order.shipping_address_snapshot && (
        <div className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle text-xs space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-[#171717]">Delivery Address</h3>
          <p className="font-semibold text-[#171717]">{order.shipping_address_snapshot.full_name}</p>
          <p className="text-[#77736C]">
            {order.shipping_address_snapshot.address_line1}
            {order.shipping_address_snapshot.address_line2 && `, ${order.shipping_address_snapshot.address_line2}`}<br />
            {order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.state} — {order.shipping_address_snapshot.postal_code}<br />
            Phone: {order.shipping_address_snapshot.phone}
          </p>
        </div>
      )}
    </div>
  );
}
