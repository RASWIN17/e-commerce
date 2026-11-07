'use client';

import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([
    {
      id: 'cpn-1',
      code: 'FIRST10',
      description: '10% discount on first order',
      discountType: 'percentage',
      value: 10,
      minCartRupees: 0,
      redemptions: 64,
      isActive: true,
    },
    {
      id: 'cpn-2',
      code: 'IMAGIX100',
      description: 'Flat ₹100 discount on orders above ₹999',
      discountType: 'fixed',
      value: 100,
      minCartRupees: 999,
      redemptions: 38,
      isActive: true,
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState(10);
  const [minCart, setMinCart] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setCoupons((prev) => [
      ...prev,
      {
        id: `cpn-${Date.now()}`,
        code: code.toUpperCase().trim(),
        description: desc,
        discountType,
        value: Number(value),
        minCartRupees: Number(minCart),
        redemptions: 0,
        isActive: true,
      },
    ]);
    setShowAdd(false);
    setCode('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Coupon & Discount Rules
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Configure promotional promo codes, cart thresholds, and redemption rules.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
              <th className="py-3 px-4 font-medium">Coupon Code</th>
              <th className="py-3 px-4 font-medium">Discount</th>
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium">Min Cart</th>
              <th className="py-3 px-4 font-medium">Redemptions</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
            {coupons.map((cpn) => (
              <tr key={cpn.id} className="hover:bg-[#F7F6F2]">
                <td className="py-3 px-4 font-mono font-bold text-[#171717]">{cpn.code}</td>
                <td className="py-3 px-4 font-semibold text-emerald-800">
                  {cpn.discountType === 'percentage' ? `${cpn.value}% Off` : `₹${cpn.value} Off`}
                </td>
                <td className="py-3 px-4 text-[#77736C]">{cpn.description}</td>
                <td className="py-3 px-4">
                  {cpn.minCartRupees > 0 ? `₹${cpn.minCartRupees}` : 'No Min'}
                </td>
                <td className="py-3 px-4">{cpn.redemptions} used</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 rounded-sm max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-[#171717]">Create Promo Code</h2>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Code (e.g. FESTIVE20)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm uppercase"
              />
              <input
                type="text"
                required
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Value"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                />
              </div>
              <input
                type="number"
                placeholder="Min Cart Value (₹)"
                value={minCart}
                onChange={(e) => setMinCart(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-[#77736C]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#171717] text-white rounded-sm font-semibold">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

