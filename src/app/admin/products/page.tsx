'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit3, Trash2, Eye, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  fabric_info?: string;
  fit_info?: string;
  base_price_paise: number;
  compare_at_price_paise?: number;
  prior_30d_price_paise?: number;
  gst_rate_percentage?: number;
  is_featured: boolean;
  is_active: boolean;
  images: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    is_primary?: boolean;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    color_name: string;
    price_paise: number;
    qikink_sku?: string;
  }>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('799');
  const [newComparePrice, setNewComparePrice] = useState('1199');
  const [newFabric, setNewFabric] = useState('100% Combed Compact Cotton, 240 GSM');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop'
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSaving(true);
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const pricePaise = parseInt(newPrice, 10) * 100;
      const comparePricePaise = parseInt(newComparePrice, 10) * 100;

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug,
          fabric_info: newFabric,
          base_price_paise: pricePaise,
          compare_at_price_paise: comparePricePaise,
          prior_30d_price_paise: comparePricePaise,
          image_url: newImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`Product "${newName}" successfully created in database!`);
        setShowAddModal(false);
        setNewName('');
        fetchProducts();
      } else {
        alert(`Failed to create product: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Product creation failed'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Manage your store apparel, pricing, CPA prior-price rules, and inventory connected to Supabase.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-sm flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#171717]" />
            <p className="text-xs text-[#77736C] mt-2">Loading products from Supabase...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No products found in catalog. Click "Add New Product" to add your first item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Selling Price</th>
                  <th className="py-3 px-4 font-medium">Prior 30-Day</th>
                  <th className="py-3 px-4 font-medium">GST</th>
                  <th className="py-3 px-4 font-medium">Variants & Sizes</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Storefront</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                {products.map((p) => {
                  const primaryImg = p.images?.[0]?.image_url || '/placeholder.png';
                  return (
                    <tr key={p.id} className="hover:bg-[#F7F6F2]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EFECE6] relative rounded-sm overflow-hidden flex-shrink-0 border border-[#E8E5DF]">
                            <Image
                              src={primaryImg}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#171717] block">{p.name}</span>
                            <span className="text-[11px] text-[#77736C] font-mono">{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#171717]">
                        ₹{(p.base_price_paise / 100).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-[#77736C]">
                        ₹{((p.prior_30d_price_paise || p.base_price_paise) / 100).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-[#77736C]">{p.gst_rate_percentage || 5}%</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.variants?.slice(0, 4).map((v) => (
                            <span
                              key={v.id}
                              className="bg-[#EFECE6] text-[#171717] px-1.5 py-0.5 rounded-xs text-[10px] font-mono"
                            >
                              {v.size}
                            </span>
                          ))}
                          {(p.variants?.length || 0) > 4 && (
                            <span className="text-[10px] text-[#77736C]">
                              +{p.variants.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            p.is_active
                              ? 'text-emerald-800 bg-emerald-50'
                              : 'text-gray-600 bg-gray-100'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="border border-[#D5D1C8] px-2.5 py-1 rounded-sm text-[11px] text-[#171717] hover:bg-[#F7F6F2] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4 border border-[#E8E5DF]">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                Add Apparel Product
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#77736C] hover:text-[#171717] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cyberpunk Graphic Heavyweight Tee"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">MRP / Compare At (₹)</label>
                  <input
                    type="number"
                    required
                    value={newComparePrice}
                    onChange={(e) => setNewComparePrice(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Fabric & GSM</label>
                <input
                  type="text"
                  value={newFabric}
                  onChange={(e) => setNewFabric(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#171717] text-white px-4 py-2 rounded-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-50"
                >
                  {saving ? 'Creating Product...' : 'Create in Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
