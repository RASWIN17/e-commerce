'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Eye, CheckCircle2, Loader2, AlertTriangle, Tag } from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  category?: CategoryInfo | null;
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
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPrice, setNewPrice] = useState('799');
  const [newComparePrice, setNewComparePrice] = useState('1199');
  const [newFabric, setNewFabric] = useState('100% Combed Compact Cotton, 240 GSM');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop'
  );

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
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
          category_id: newCategoryId || null,
          fabric_info: newFabric,
          base_price_paise: pricePaise,
          compare_at_price_paise: comparePricePaise,
          prior_30d_price_paise: comparePricePaise,
          image_url: newImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Product "${newName}" created successfully!`, type: 'success' });
        setShowAddModal(false);
        setNewName('');
        setNewCategoryId('');
        fetchCatalogData();
      } else {
        setMessage({ text: `Failed to create product: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message || 'Product creation failed'}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Product "${productToDelete.name}" deleted successfully from catalog.`, type: 'success' });
        setProductToDelete(null);
        fetchCatalogData();
      } else {
        setMessage({ text: `Failed to delete product: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error deleting product: ${err.message}`, type: 'error' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(null), 5000);
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
            Manage your store apparel, categorize styles, and remove discontinued products from Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/categories"
            className="border border-[#D5D1C8] text-[#171717] px-3.5 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-white rounded-sm inline-flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Categories</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
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
            <p className="text-xs text-[#77736C] mt-2">Loading products from Supabase...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No products found in catalog. Click &quot;Add New Product&quot; to add your first item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Selling Price</th>
                  <th className="py-3 px-4 font-medium">Prior 30-Day</th>
                  <th className="py-3 px-4 font-medium">Sizes</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
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
                      <td className="py-3 px-4">
                        {p.category?.name ? (
                          <span className="bg-[#EFECE6] text-[#171717] px-2 py-0.5 rounded-sm text-[11px] font-medium">
                            {p.category.name}
                          </span>
                        ) : (
                          <span className="text-[#77736C] text-[11px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#171717]">
                        ₹{(p.base_price_paise / 100).toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-[#77736C]">
                        ₹{((p.prior_30d_price_paise || p.base_price_paise) / 100).toFixed(0)}
                      </td>
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
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="border border-[#D5D1C8] px-2 py-1 rounded-sm text-[11px] text-[#171717] hover:bg-white inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-sm text-[11px] font-medium inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 space-y-4 border border-[#E8E5DF]">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#171717]">Delete Product from Store</h3>
                <p className="text-xs text-[#77736C]">This action permanently removes the product and its variants.</p>
              </div>
            </div>

            <p className="text-xs text-[#171717] bg-[#F7F6F2] p-3 rounded-sm border border-[#E8E5DF]">
              Are you sure you want to delete <strong className="font-semibold text-black">{productToDelete.name}</strong>? 
              This will remove its storefront page, variants, and design links immediately.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E5DF]">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-xs font-medium hover:bg-[#F7F6F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={handleDeleteProduct}
                className="bg-rose-700 text-white px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4 border border-[#E8E5DF] max-h-[90vh] overflow-y-auto">
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

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Product Category</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                >
                  <option value="">-- Select a Category (or leave Unassigned) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#77736C] mt-1">
                  Need a new category? You can create one in the <Link href="/admin/categories" className="underline font-medium text-black">Category Manager</Link>.
                </p>
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
