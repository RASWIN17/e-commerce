'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ExternalLink,
  Search,
} from 'lucide-react';

interface AdminOrder {
  id: string;
  customerName: string;
  email: string;
  totalRupees: number;
  paymentStatus: string;
  gatewayRef: string;
  fulfilmentStatus: string;
  qikinkOrderId: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  retryCount: number;
  lastError?: string;
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'IMX-839201',
      customerName: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      totalRupees: 799,
      paymentStatus: 'PAID',
      gatewayRef: 'cf_pay_9483921049',
      fulfilmentStatus: 'in_production',
      qikinkOrderId: 'QK-92819-2026',
      carrier: 'Delhivery',
      trackingNumber: 'DL94839210IN',
      retryCount: 0,
    },
    {
      id: 'IMX-839198',
      customerName: 'Priya Iyer',
      email: 'priya.iyer@outlook.com',
      totalRupees: 899,
      paymentStatus: 'PAID',
      gatewayRef: 'cf_pay_9483920912',
      fulfilmentStatus: 'submitted',
      qikinkOrderId: 'QK-92815-2026',
      carrier: 'Bluedart Air',
      trackingNumber: 'BD7482910IN',
      retryCount: 0,
    },
    {
      id: 'IMX-839180',
      customerName: 'Vikram Joshi',
      email: 'vikram.j@gmail.com',
      totalRupees: 1699,
      paymentStatus: 'PAID',
      gatewayRef: 'cf_pay_9483918841',
      fulfilmentStatus: 'failed',
      qikinkOrderId: null,
      carrier: null,
      trackingNumber: null,
      retryCount: 1,
      lastError: 'Qikink API timeout while submitting Tirupur queue',
    },
  ]);

  const [message, setMessage] = useState('');

  const handleRetryFulfilment = (orderId: string) => {
    setMessage(`Fulfilment job for ${orderId} queued for re-submission with exponential backoff.`);
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              fulfilmentStatus: 'submitted',
              qikinkOrderId: `QK-${Date.now().toString().slice(-5)}`,
              retryCount: ord.retryCount + 1,
              lastError: undefined,
            }
          : ord
      )
    );
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRefund = (orderId: string) => {
    if (confirm(`Are you sure you want to trigger a Cashfree refund for ${orderId}?`)) {
      setMessage(`Refund request for ${orderId} submitted to Cashfree API.`);
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? { ...ord, paymentStatus: 'REFUNDED', fulfilmentStatus: 'cancelled' }
            : ord
        )
      );
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Orders & Automated Fulfilment Queue
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Monitor Cashfree payment confirmations, Qikink API requests, retry failed jobs, and manage cancellations.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-sm flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID or customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5D1C8] rounded-sm focus:outline-none focus:border-[#171717]"
          />
          <Search className="w-4 h-4 text-[#77736C] absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 bg-white border border-[#D5D1C8] rounded-sm"
        >
          <option value="all">All Fulfilment States</option>
          <option value="in_production">In Production</option>
          <option value="submitted">Submitted</option>
          <option value="failed">Failed / Needs Retry</option>
          <option value="cancelled">Cancelled / Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Cashfree Status</th>
                <th className="py-3 px-4 font-medium">Qikink Reference</th>
                <th className="py-3 px-4 font-medium">Tracking</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 font-semibold text-[#171717]">{ord.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#171717] block">{ord.customerName}</span>
                    <span className="text-[11px] text-[#77736C]">{ord.email}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#171717]">₹{ord.totalRupees}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        ord.paymentStatus === 'PAID'
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-amber-800 bg-amber-50'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {ord.qikinkOrderId ? (
                      <span className="font-mono text-[#171717]">{ord.qikinkOrderId}</span>
                    ) : (
                      <span className="text-rose-700 font-medium">Not Assigned</span>
                    )}
                    {ord.lastError && (
                      <p className="text-[10px] text-rose-600 mt-0.5">{ord.lastError}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {ord.trackingNumber ? (
                      <div>
                        <span className="font-mono text-[11px] block">{ord.trackingNumber}</span>
                        <span className="text-[10px] text-[#77736C]">{ord.carrier}</span>
                      </div>
                    ) : (
                      <span className="text-[#77736C]">Awaiting pickup</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {ord.fulfilmentStatus === 'failed' && (
                      <button
                        onClick={() => handleRetryFulfilment(ord.id)}
                        className="bg-amber-600 text-white px-2.5 py-1 rounded-sm text-[11px] font-medium hover:bg-amber-700"
                      >
                        Retry Qikink
                      </button>
                    )}
                    {ord.paymentStatus === 'PAID' && (
                      <button
                        onClick={() => handleRefund(ord.id)}
                        className="border border-[#D5D1C8] px-2 py-1 rounded-sm text-[11px] text-rose-600 hover:bg-rose-50"
                      >
                        Refund
                      </button>
                    )}
                    <Link
                      href={`/orders/${ord.id}/track`}
                      target="_blank"
                      className="border border-[#D5D1C8] px-2 py-1 rounded-sm text-[11px] text-[#171717] hover:bg-[#F7F6F2] inline-block"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
