'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, ChevronRight, FileText } from 'lucide-react';

export default function MyOrdersPage() {
  const orders = [
    {
      id: 'IMX-839201',
      date: '07 Nov 2026',
      items: [
        {
          name: 'Sunset Graphic Tee',
          size: 'M',
          color: 'Washed Black',
          qty: 1,
          price: 799,
        },
      ],
      totalRupees: 799,
      status: 'In Production',
      statusColor: 'text-emerald-800 bg-emerald-50',
      carrier: 'Delhivery',
    },
    {
      id: 'IMX-719302',
      date: '28 Oct 2026',
      items: [
        {
          name: 'Dream Big Tee',
          size: 'L',
          color: 'Sand Beige',
          qty: 1,
          price: 799,
        },
        {
          name: 'Botanical Canvas Tote Bag',
          size: 'One Size',
          color: 'Natural Ecru',
          qty: 1,
          price: 499,
        },
      ],
      totalRupees: 1298,
      status: 'Delivered',
      statusColor: 'text-gray-800 bg-gray-100',
      carrier: 'Bluedart Express',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-xs text-[#77736C] hover:text-[#171717]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Account</span>
      </Link>

      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">My Orders</h1>
        <p className="text-xs text-[#77736C] mt-1">
          Review your previous orders, print status, and courier tracking details.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5DF] pb-3 text-xs">
              <div>
                <span className="font-semibold text-[#171717]">Order #{ord.id}</span>
                <span className="text-[#77736C] ml-3">Placed on {ord.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm ${ord.statusColor}`}
                >
                  {ord.status}
                </span>
                <span className="font-bold text-[#171717]">₹{ord.totalRupees}</span>
              </div>
            </div>

            <div className="divide-y divide-[#E8E5DF] text-xs">
              {ord.items.map((it, i) => (
                <div key={i} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-medium text-[#171717]">{it.name}</span>
                    <p className="text-[#77736C]">
                      {it.color} • Size {it.size} • Qty {it.qty}
                    </p>
                  </div>
                  <span className="font-semibold text-[#171717]">₹{it.price}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E5DF]">
              <div className="text-[11px] text-[#77736C]">
                Fulfilled automatically via Tirupur Hub • Carrier: {ord.carrier}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/orders/${ord.id}/track`}
                  className="bg-[#171717] text-white px-4 py-2 text-xs uppercase font-medium tracking-wider rounded-sm hover:bg-[#2A2A2A]"
                >
                  Track Order
                </Link>
                <button
                  onClick={() => alert(`Downloading official GST invoice for ${ord.id}...`)}
                  className="border border-[#D5D1C8] px-3 py-2 text-xs text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
                >
                  Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

