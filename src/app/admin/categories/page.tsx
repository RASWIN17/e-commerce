'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Eye, CheckCircle2, Loader2, AlertTriangle, Folder, Package, ArrowLeft } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop'
  );
  const [displayOrder, setDisplayOrder] = useState('0');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          image_url: imageUrl,
          display_order: parseInt(displayOrder, 10) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Category "${name}" created successfully!`, type: 'success' });
        setShowAddModal(false);
        setName('');
        setSlug('');
        setDescription('');
        fetchCategories();
      } else {
        setMessage({ text: `Failed to create category: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message || 'Category creation failed'}`, type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingId(categoryToDelete.id);
      const res = await fetch(`/api/admin/categories?id=${categoryToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Category "${categoryToDelete.name}" deleted successfully.`, type: 'success' });
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        setMessage({ text: `Failed to delete category: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error deleting category: ${err.message}`, type: 'error' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/products" className="text-xs text-[#77736C] hover:text-[#171717] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Category Management
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Create, manage, and delete product categories. Products can be organized under these categories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
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

      {/* Categories Grid */}
      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#171717]" />
            <p className="text-xs text-[#77736C] mt-2">Loading categories from Supabase...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77736C]">
            No categories found. Click &quot;Add New Category&quot; to create your first category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Slug</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Assigned Products</th>
                  <th className="py-3 px-4 font-medium">Order</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F6F2]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#EFECE6] relative rounded-sm overflow-hidden flex-shrink-0 border border-[#E8E5DF]">
                          <Image
                            src={c.image_url || '/placeholder.png'}
                            alt={c.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[#171717]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#77736C]">
                      {c.slug}
                    </td>
                    <td className="py-3 px-4 text-[#77736C] max-w-xs truncate">
                      {c.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#EFECE6] text-[#171717] px-2 py-0.5 rounded-sm text-[11px] font-semibold inline-flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#77736C]" />
                        <span>{c.productCount} {c.productCount === 1 ? 'Product' : 'Products'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#77736C]">
                      {c.display_order}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/category/${c.slug}`}
                        target="_blank"
                        className="border border-[#D5D1C8] px-2 py-1 rounded-sm text-[11px] text-[#171717] hover:bg-white inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => setCategoryToDelete(c)}
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

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 space-y-4 border border-[#E8E5DF]">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#171717]">Delete Category</h3>
                <p className="text-xs text-[#77736C]">This removes the category from the store taxonomy.</p>
              </div>
            </div>

            <p className="text-xs text-[#171717] bg-[#F7F6F2] p-3 rounded-sm border border-[#E8E5DF]">
              Are you sure you want to delete <strong className="font-semibold text-black">{categoryToDelete.name}</strong>?
              {categoryToDelete.productCount > 0 && (
                <span className="block mt-1 text-amber-800">
                  ⚠️ Note: {categoryToDelete.productCount} product(s) currently assigned to this category will not be deleted; their category will be set to Unassigned.
                </span>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E5DF]">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-xs font-medium hover:bg-[#F7F6F2]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={handleDeleteCategory}
                className="bg-rose-700 text-white px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4 border border-[#E8E5DF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                Add Product Category
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#77736C] hover:text-[#171717] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Oversized Tees, Hoodies, Sweatshirts"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., oversized-tees"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] font-mono"
                />
                <span className="text-[10px] text-[#77736C] mt-1 block">
                  Accessible at /category/{slug || '...'}
                </span>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description for storefront category banner..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Category Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
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
                  {saving ? 'Creating Category...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

