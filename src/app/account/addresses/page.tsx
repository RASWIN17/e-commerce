'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { ArrowLeft, Plus, MapPin, Trash2, RefreshCw } from 'lucide-react';

export default function SavedAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const loadAddresses = async () => {
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

      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false });

      if (!error && data) {
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSubmitting(true);
      const supabase = createClient();
      const isFirst = addresses.length === 0;

      const { error } = await supabase.from('user_addresses').insert({
        user_id: userId,
        full_name: newAddr.fullName,
        phone: newAddr.phone,
        address_line1: newAddr.addressLine1,
        address_line2: newAddr.addressLine2 || null,
        city: newAddr.city,
        state: newAddr.state,
        postal_code: newAddr.postalCode,
        country: 'India',
        is_default: isFirst,
      });

      if (error) {
        throw error;
      }

      setShowAddModal(false);
      setNewAddr({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
      });
      await loadAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const supabase = createClient();
      await supabase.from('user_addresses').delete().eq('id', id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Loading saved delivery addresses...</p>
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

      <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Saved Addresses</h1>
          <p className="text-xs text-[#77736C] mt-1">
            Store multiple delivery locations for seamless checkout.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase font-medium tracking-wider hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-[#E8E5DF] p-12 rounded-sm text-center space-y-3">
          <MapPin className="w-10 h-10 text-[#D5D1C8] mx-auto" />
          <h2 className="text-sm font-bold text-[#171717]">No Saved Addresses</h2>
          <p className="text-xs text-[#77736C]">
            You have not saved any delivery addresses yet. Add your primary shipping address for fast checkout.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block bg-[#171717] text-white px-5 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#2A2A2A]"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-3 relative"
            >
              {addr.is_default && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Default Address
                </span>
              )}
              <h3 className="text-sm font-semibold text-[#171717]">{addr.full_name}</h3>
              <div className="text-xs text-[#77736C] space-y-0.5">
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>
                  {addr.city}, {addr.state} — {addr.postal_code}
                </p>
                <p className="pt-1 text-[#171717] font-medium">Phone: {addr.phone}</p>
              </div>

              <div className="pt-3 border-t border-[#E8E5DF] flex items-center gap-4 text-xs">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 rounded-sm max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-[#171717]">Add New Address</h2>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <input
                type="tel"
                required
                placeholder="10-digit Phone"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, '') })}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <input
                type="text"
                required
                placeholder="Address Line 1"
                value={newAddr.addressLine1}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={newAddr.addressLine2}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="PIN Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                />
              </div>
              <input
                type="text"
                required
                placeholder="State"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-[#77736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#171717] text-white rounded-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
