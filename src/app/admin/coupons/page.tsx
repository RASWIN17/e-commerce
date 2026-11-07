'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_cart_value_paise: number;
  max_discount_paise?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [value, setValue] = useState(10);
  const [minCartRupees, setMinCartRupees] = useState(0);
  const [maxDiscountRupees, setMaxDiscountRupees] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discount_type: discountType,
          discount_value: Number(value),
          min_cart_value_paise: Math.round(Number(minCartRupees) * 100),
          max_discount_paise: maxDiscountRupees ? Math.round(Number(maxDiscountRupees) * 100) : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Coupon "${code.toUpperCase()}" created successfully!`, type: 'success' });
        setShowAdd(false);
        setCode('');
        setValue(10);
        setMinCartRupees(0);
        setMaxDiscountRupees('');
        fetchCoupons();
      } else {
        setMessage({ text: `Failed to create coupon: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      fetchCoupons();
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${codeName}?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `Coupon ${codeName} deleted.`, type: 'success' });
        fetchCoupons();
      }
    } catch (err: any) {
      setMessage({ text: `Error deleting coupon: ${err.message}`, type: 'error' });
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Coupons & Promotional Offers
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Manage discount codes, cart minimums, and promotional campaigns connected to checkout.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-sm flex items-center gap-2 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#171717]" />
            <p className="text-xs text-[#77736C] mt-2">Loading coupons from Supabase...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No coupons active in store. Click &quot;Create New Coupon&quot; to launch your first promotional discount.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                  <th className="py-3 px-4 font-medium">Coupon Code</th>
                  <th className="py-3 px-4 font-medium">Discount</th>
                  <th className="py-3 px-4 font-medium">Min Cart Value</th>
                  <th className="py-3 px-4 font-medium">Times Used</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F6F2]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#171717]" />
                        <span className="font-mono font-bold text-sm text-[#171717]">{c.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#171717]">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}
                      {c.max_discount_paise ? (
                        <span className="text-[10px] text-[#77736C] block">
                          Up to ₹{(c.max_discount_paise / 100).toFixed(0)}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4 text-[#77736C]">
                      {c.min_cart_value_paise > 0 ? `₹${(c.min_cart_value_paise / 100).toFixed(0)}` : 'None'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#171717]">
                      {c.used_count || 0} orders
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(c.id, c.is_active)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm cursor-pointer ${
                          c.is_active
                            ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {c.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-sm text-[11px] font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 space-y-4 border border-[#E8E5DF]">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                Create Promotional Coupon
              </h2>
              <button onClick={() => setShowAdd(false)} className="text-[#77736C] hover:text-[#171717]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FESTIVE20, OVERSIZED50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm font-mono text-xs text-[#171717] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">
                    Value ({discountType === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minCartRupees}
                    onChange={(e) => setMinCartRupees(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxDiscountRupees}
                    onChange={(e) => setMaxDiscountRupees(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#171717] text-white px-4 py-2 rounded-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
