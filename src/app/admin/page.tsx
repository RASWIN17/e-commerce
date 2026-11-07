'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../lib/data/sampleProducts';

export default function AdminOverviewPage() {
  const stats = [
    { label: 'Total Revenue (Net)', value: '₹1,48,250', change: '+18.4% this week', icon: TrendingUp },
    { label: 'Total Orders', value: '186', change: '174 Paid & Verified', icon: ShoppingBag },
    { label: 'Qikink Production Hub', value: '12 Active', change: '8 Queued in Outbox', icon: Clock },
    { label: 'Fulfilment Health', value: '99.4%', change: '0 Stalled Jobs', icon: CheckCircle2 },
  ];

  const recentOrders = [
    {
      id: 'IMX-839201',
      customer: 'Rahul Sharma (Bengaluru)',
      product: 'Sunset Graphic Tee (M)',
      amount: '₹799',
      payment: 'PAID (Cashfree UPI)',
      qikinkStatus: 'In Production (Tirupur)',
      time: '15 mins ago',
    },
    {
      id: 'IMX-839198',
      customer: 'Priya Iyer (Chennai)',
      product: 'Mountain Vibes Tee (S)',
      amount: '₹899',
      payment: 'PAID (Cashfree Card)',
      qikinkStatus: 'Submitted to Qikink',
      time: '1 hour ago',
    },
    {
      id: 'IMX-839185',
      customer: 'Arjun Verma (Mumbai)',
      product: 'Heavyweight Studio Hoodie (L)',
      amount: '₹1,699',
      payment: 'PAID (Cashfree NetBanking)',
      qikinkStatus: 'Shipped (Delhivery Air)',
      time: '3 hours ago',
    },
    {
      id: 'IMX-839170',
      customer: 'Ananya Roy (Kolkata)',
      product: 'Dream Big Tee (M)',
      amount: '₹799',
      payment: 'PAID (Cashfree UPI)',
      qikinkStatus: 'Delivered',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Store Operations Overview
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Real-time analytics for IMAGIX D2C storefront, Cashfree settlement, and Qikink automated POD outbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/qikink-designs"
            className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5"
          >
            <span>Qikink Design Mapper</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white border border-[#E8E5DF] p-5 rounded-sm shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#77736C]">{s.label}</span>
                <Icon className="w-4 h-4 text-[#171717]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">{s.value}</div>
              <p className="text-[11px] text-emerald-800 font-medium">{s.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Fulfilment Outbox */}
      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
              Live Order Stream & Qikink Status
            </h2>
            <p className="text-xs text-[#77736C]">
              Transactions authenticated by Cashfree webhooks and dispatched via Qikink API.
            </p>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#171717] underline font-semibold">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E5DF] text-[#77736C]">
                <th className="py-2.5 font-medium">Order Number</th>
                <th className="py-2.5 font-medium">Customer</th>
                <th className="py-2.5 font-medium">Item & Variant</th>
                <th className="py-2.5 font-medium">Amount</th>
                <th className="py-2.5 font-medium">Payment State</th>
                <th className="py-2.5 font-medium">Qikink Fulfilment</th>
                <th className="py-2.5 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 font-semibold text-[#171717]">{ord.id}</td>
                  <td className="py-3">{ord.customer}</td>
                  <td className="py-3 text-[#77736C]">{ord.product}</td>
                  <td className="py-3 font-semibold">{ord.amount}</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      {ord.payment}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold text-gray-800 bg-[#EFECE6] px-2 py-0.5 rounded-sm">
                      {ord.qikinkStatus}
                    </span>
                  </td>
                  <td className="py-3 text-[#77736C]">{ord.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Catalogue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E5DF] rounded-sm p-6 space-y-4 shadow-subtle">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Top Velocity Products
          </h2>
          <div className="space-y-3">
            {SAMPLE_PRODUCTS.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-[#E8E5DF] last:border-b-0">
                <div>
                  <span className="font-semibold text-[#171717]">{p.name}</span>
                  <p className="text-[#77736C] text-[11px]">{p.fabric_info.split(',')[0]}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#171717]">₹{(p.base_price_paise / 100).toFixed(0)}</span>
                  <p className="text-[11px] text-emerald-800">40+ sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#EFECE6] rounded-sm p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#171717]">
              Qikink Open API & Cashfree Sandbox Status
            </h2>
            <p className="text-xs text-[#77736C] leading-relaxed">
              Your server is configured with idempotent webhook event listeners, signature validation (HMAC-SHA256), and an asynchronous transactional outbox queue with exponential backoff retry.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin/settings"
              className="inline-block bg-[#171717] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#2A2A2A]"
            >
              Verify API Credentials →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

