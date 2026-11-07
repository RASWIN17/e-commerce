'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ExternalLink,
  Search,
  Loader2,
} from 'lucide-react';

interface AdminOrder {
  id: string;
  dbId: string;
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
  createdAt: string;
  items: Array<{
    id: string;
    product_name: string;
    variant_name?: string;
    quantity: number;
    unit_price_paise: number;
    qikink_sku?: string;
  }>;
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleRetryFulfilment = async (ord: AdminOrder) => {
    try {
      setRetryingId(ord.id);
      setMessage(`Submitting fulfilment retry for order ${ord.id} to Qikink...`);

      const res = await fetch('/api/admin/fulfilment/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: ord.dbId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`Success: Order ${ord.id} submitted to Qikink! Reference: ${data.qikinkOrderId || 'Pending'}`);
        fetchOrders();
      } else {
        setMessage(`Retry failed: ${data.error || 'Qikink rejected the request'}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Retry request failed'}`);
    } finally {
      setRetryingId(null);
      setTimeout(() => setMessage(''), 6000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Orders & Automated Fulfilment Queue
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Monitor Cashfree payment confirmations, Qikink API requests, retry failed jobs, and track shipments in real time.
        </p>
      </div>

      {message && (
        <div className="bg-[#171717] text-white p-3 rounded-sm flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email, or Qikink reference..."
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
          <option value="all">All Payment States</option>
          <option value="paid">Paid & Verified</option>
          <option value="pending">Pending Payment</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="submit"
          className="bg-[#171717] text-white px-4 py-2 font-medium rounded-sm hover:bg-[#2A2A2A]"
        >
          Search
        </button>
      </form>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#171717]" />
            <p className="text-xs text-[#77736C] mt-2">Loading live orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No orders found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Payment Status</th>
                  <th className="py-3 px-4 font-medium">Qikink Fulfilment</th>
                  <th className="py-3 px-4 font-medium">Tracking</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#F7F6F2]">
                    <td className="py-3 px-4 font-semibold text-[#171717]">
                      <div>{ord.id}</div>
                      <span className="text-[10px] text-[#77736C] font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[#171717]">{ord.qikinkOrderId}</span>
                          <a
                            href={`/api/admin/qikink/order?id=${ord.qikinkOrderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View live Qikink order data"
                            className="text-[#77736C] hover:text-[#171717]"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {ord.paymentStatus === 'PAID' ? 'Queued for Qikink' : 'Awaiting Payment'}
                        </span>
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
                        <span className="text-[#77736C]">Pending production</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {ord.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleRetryFulfilment(ord)}
                          disabled={retryingId === ord.id}
                          className="bg-[#171717] text-white px-2.5 py-1 rounded-sm text-[11px] font-medium hover:bg-[#2A2A2A] disabled:opacity-50"
                        >
                          {retryingId === ord.id ? 'Retrying...' : 'Dispatch Qikink'}
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
        )}
      </div>
    </div>
  );
}
