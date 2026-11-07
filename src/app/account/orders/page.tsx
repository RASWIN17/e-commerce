'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { ArrowLeft, Package, ChevronRight, FileText, ShoppingBag, RefreshCw } from 'lucide-react';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*), payments(*), fulfilment_jobs(*)')
          .or(`user_id.eq.${session.user.id},guest_email.eq.${session.user.email}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Loading your orders history...</p>
      </div>
    );
  }

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

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E8E5DF] p-12 rounded-sm text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-[#D5D1C8] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#171717]">No Orders Yet</h2>
            <p className="text-xs text-[#77736C]">
              You haven&apos;t placed any orders yet. Discover our collection of heavyweights and graphic tees.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-block bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#2A2A2A]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const formattedDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const isConfirmed = ['confirmed', 'in_production', 'dispatched', 'delivered'].includes(ord.status);

            return (
              <div
                key={ord.id}
                className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5DF] pb-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#171717]">Order #{ord.order_number}</span>
                    <span className="text-[#77736C] ml-3">Placed on {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm capitalize ${
                        isConfirmed ? 'text-emerald-800 bg-emerald-50' : 'text-amber-800 bg-amber-50'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-[#171717]">
                      ₹{((ord.total_amount_paise || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#E8E5DF] text-xs">
                  {(ord.order_items || []).map((it: any) => (
                    <div key={it.id} className="py-2.5 flex justify-between">
                      <div>
                        <span className="font-medium text-[#171717]">{it.product_name}</span>
                        <p className="text-[#77736C] text-[11px]">
                          {it.variant_name} • Qty {it.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-[#171717]">
                        ₹{((it.total_price_paise || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E5DF]">
                  <div className="text-[11px] text-[#77736C]">
                    Estimated delivery: {ord.delivery_estimate_date || 'Standard shipping'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${ord.order_number}/track`}
                      className="bg-[#171717] text-white px-4 py-2 text-xs uppercase font-medium tracking-wider rounded-sm hover:bg-[#2A2A2A]"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
