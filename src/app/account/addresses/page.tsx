'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2 } from 'lucide-react';

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      addressLine1: 'Flat 402, Sunrise Residency, 14th Main Rd',
      addressLine2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses((prev) => [
      ...prev,
      {
        ...newAddr,
        id: `addr-${Date.now()}`,
        isDefault: prev.length === 0,
      },
    ]);
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
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-3 relative"
          >
            {addr.isDefault && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                Default Delivery Address
              </span>
            )}
            <h3 className="text-sm font-semibold text-[#171717]">{addr.fullName}</h3>
            <div className="text-xs text-[#77736C] space-y-0.5">
              <p>{addr.addressLine1}</p>
              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
              <p>
                {addr.city}, {addr.state} — {addr.postalCode}
              </p>
              <p className="pt-1 text-[#171717] font-medium">Phone: {addr.phone}</p>
            </div>

            <div className="pt-3 border-t border-[#E8E5DF] flex items-center gap-4 text-xs">
              <button
                onClick={() => setAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
                className="text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

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
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
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
                  placeholder="PIN Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
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
                  className="px-4 py-2 bg-[#171717] text-white rounded-sm font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

