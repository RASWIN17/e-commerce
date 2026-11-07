'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import {
  Package,
  MapPin,
  Heart,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        } else {
          // Fallback guest profile for preview
          setUser({
            email: 'customer@imagix.in',
            user_metadata: { full_name: 'Rahul Sharma' },
          });
        }
      } catch (e) {
        setUser({
          email: 'customer@imagix.in',
          user_metadata: { full_name: 'Rahul Sharma' },
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Header */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EFECE6] border border-[#D5D1C8] flex items-center justify-center text-lg font-bold text-[#171717]">
            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#171717]">
              {user?.user_metadata?.full_name || 'Valued Member'}
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
          <p className="text-xs text-[#77736C]">Track current shipments, past drops and invoices.</p>
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-semibold text-[#171717]">Order #IMX-839201</span>
            <p className="text-[#77736C] mt-0.5">Sunset Graphic Tee (M, Washed Black) • 1 item</p>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">
              • Status: Sent to Qikink Production (Tirupur)
            </p>
          </div>

          <Link
            href="/orders/IMX-839201/track"
            className="inline-block bg-[#171717] text-white px-4 py-2 rounded-sm text-xs uppercase font-medium tracking-wider hover:bg-[#2A2A2A] self-start sm:self-auto"
          >
            Track Shipment
          </Link>
        </div>
      </div>
    </div>
  );
}

