'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import {
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Clock,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        // Fetch real profile from Supabase
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(prof || null);

        // Fetch recent order for this user
        const { data: orders } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`user_id.eq.${session.user.id},guest_email.eq.${session.user.email}`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (orders && orders.length > 0) {
          setRecentOrder(orders[0]);
        }
      } catch (e) {
        console.error('Error loading account data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    router.push('/');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#77736C]">
        Loading your account details...
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Header */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EFECE6] border border-[#D5D1C8] flex items-center justify-center text-lg font-bold text-[#171717]">
            {initial}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#171717]">
              {displayName}
            </h1>
            <p className="text-xs text-[#77736C]">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 border border-[#D5D1C8] px-4 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F6F2] rounded-sm transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle hover:border-[#171717] transition-colors group space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <Package className="w-5 h-5 text-[#171717]" />
            <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-sm font-semibold text-[#171717]">My Orders</h2>
          <p className="text-xs text-[#77736C]">Track current shipments, past drops, and invoices.</p>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle hover:border-[#171717] transition-colors group space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <MapPin className="w-5 h-5 text-[#171717]" />
            <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-sm font-semibold text-[#171717]">Saved Addresses</h2>
          <p className="text-xs text-[#77736C]">Manage delivery addresses for expedited checkout.</p>
        </Link>

        <Link
          href="/wishlist"
          className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle hover:border-[#171717] transition-colors group space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <Heart className="w-5 h-5 text-[#171717]" />
            <ChevronRight className="w-4 h-4 text-[#77736C] group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-sm font-semibold text-[#171717]">Wishlist</h2>
          <p className="text-xs text-[#77736C]">Your curated favorite pieces and upcoming drops.</p>
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
          <h2 className="text-base font-bold tracking-tight text-[#171717]">Recent Order</h2>
          <Link href="/account/orders" className="text-xs font-medium text-[#171717] underline">
            View All Orders
          </Link>
        </div>

        {recentOrder ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-semibold text-[#171717]">Order #{recentOrder.order_number}</span>
              <p className="text-[#77736C] mt-0.5">
                {recentOrder.order_items?.[0]?.product_name || 'Item'} • Total: ₹{(recentOrder.total_amount_paise / 100).toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium mt-1">
                • Status: {recentOrder.status}
              </p>
            </div>

            <Link
              href={`/orders/${recentOrder.order_number}/track`}
              className="inline-block bg-[#171717] text-white px-4 py-2 rounded-sm text-xs uppercase font-medium tracking-wider hover:bg-[#2A2A2A] self-start sm:self-auto"
            >
              Track Shipment
            </Link>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3 text-xs text-[#77736C]">
            <ShoppingBag className="w-8 h-8 mx-auto text-[#D5D1C8]" />
            <p>You haven&apos;t placed any orders yet.</p>
            <Link
              href="/shop"
              className="inline-block bg-[#171717] text-white px-5 py-2 uppercase tracking-wider font-semibold rounded-sm hover:bg-[#2A2A2A]"
            >
              Explore Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
