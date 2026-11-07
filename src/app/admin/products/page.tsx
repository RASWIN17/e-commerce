'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Eye, CheckCircle2, Loader2, AlertTriangle, Tag, Sliders, Edit3, X, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface VariantItem {
  id?: string;
  sku: string;
  size: string;
  color_name: string;
  price_paise?: number;
  qikink_sku?: string;
  stock_quantity?: number;
}

interface DesignItem {
  id?: string;
  design_code: string;
  artwork_url: string;
  placement: string;
  print_width_inches: number;
  print_height_inches: number;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  category?: CategoryInfo | null;
  short_description?: string;
  detailed_description?: string;
  fabric_info?: string;
  fit_info?: string;
  wash_care?: string;
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
  variants: VariantItem[];
  designs?: DesignItem[];
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Product Form states
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPrice, setNewPrice] = useState('799');
  const [newComparePrice, setNewComparePrice] = useState('1199');
  const [newGstRate, setNewGstRate] = useState('5');
  const [newFabric, setNewFabric] = useState('100% Combed Compact Cotton, 240 GSM');
  const [newFit, setNewFit] = useState('Oversized boxy drape, drop shoulder');
  const [newWashCare, setNewWashCare] = useState('Machine wash cold inside out, tumble dry low');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newDetailedDesc, setNewDetailedDesc] = useState('');
  const [newColor, setNewColor] = useState('White');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop'
  );

  // Qikink Artwork & Design fields for Add Product
  const [newDesignCode, setNewDesignCode] = useState('');
  const [newArtworkUrl, setNewArtworkUrl] = useState('');
  const [newPlacement, setNewPlacement] = useState('front');
  const [newPrintWidth, setNewPrintWidth] = useState('10');
  const [newPrintHeight, setNewPrintHeight] = useState('12');

  // Custom variants for new product
  const [variantInputs, setVariantInputs] = useState<
    Array<{ size: string; enabled: boolean; sku: string; qikink_sku: string }>
  >(
    DEFAULT_SIZES.map((size) => ({
      size,
      enabled: ['S', 'M', 'L', 'XL'].includes(size),
      sku: '',
      qikink_sku: '',
    }))
  );

  const [qikinkPattern, setQikinkPattern] = useState('');

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

  const handleNameChange = (val: string) => {
    setNewName(val);
    const prefix = `IMX-${val.slice(0, 3).toUpperCase() || 'ITM'}`;
    setVariantInputs((prev) =>
      prev.map((v) => ({
        ...v,
        sku: v.sku ? v.sku : `${prefix}-${newColor.slice(0, 3).toUpperCase()}-${v.size}`,
      }))
    );
    if (!newDesignCode) {
      setNewDesignCode(`IMX-DES-${val.slice(0, 4).toUpperCase() || 'ART'}`);
    }
  };

  const handleApplyQikinkPattern = () => {
    if (!qikinkPattern.trim()) return;
    setVariantInputs((prev) =>
      prev.map((v) => ({
        ...v,
        qikink_sku: `${qikinkPattern.trim()}-${v.size}`,
      }))
    );
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSaving(true);
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const pricePaise = parseInt(newPrice, 10) * 100;
      const comparePricePaise = parseInt(newComparePrice, 10) * 100;

      const activeVariants = variantInputs
        .filter((v) => v.enabled)
        .map((v) => ({
          size: v.size,
          color_name: newColor,
          sku: v.sku || `IMX-${slug.slice(0, 4).toUpperCase()}-${v.size}`,
          qikink_sku: v.qikink_sku || v.sku || `QIK-${v.size}`,
          price_paise: pricePaise,
        }));

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug,
          category_id: newCategoryId || null,
          short_description: newShortDesc || `${newName} tailored from heavyweight combed cotton.`,
          detailed_description: newDetailedDesc || `Precision handcrafted in Tirupur, India with tailored minimal drape.`,
          fabric_info: newFabric,
          fit_info: newFit,
          wash_care: newWashCare,
          base_price_paise: pricePaise,
          compare_at_price_paise: comparePricePaise,
          prior_30d_price_paise: comparePricePaise,
          gst_rate_percentage: parseInt(newGstRate, 10) || 5,
          image_url: newImageUrl,
          color_name: newColor,
          design_code: newDesignCode,
          artwork_url: newArtworkUrl || newImageUrl,
          placement: newPlacement,
          print_width_inches: parseFloat(newPrintWidth) || 10,
          print_height_inches: parseFloat(newPrintHeight) || 12,
          variants: activeVariants,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Product "${newName}" created successfully with custom SKUs & designs!`, type: 'success' });
        setShowAddModal(false);
        setNewName('');
        setNewCategoryId('');
        setNewDesignCode('');
        setNewArtworkUrl('');
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

  // Open Full Edit Product Modal
  const handleOpenEditProduct = (p: AdminProduct) => {
    setEditingProduct(p);
    const primaryDesign = p.designs?.[0];
    setEditFormData({
      name: p.name,
      category_id: p.category_id || '',
      base_price: (p.base_price_paise / 100).toFixed(0),
      compare_at_price: ((p.compare_at_price_paise || p.base_price_paise) / 100).toFixed(0),
      gst_rate_percentage: String(p.gst_rate_percentage || 5),
      fabric_info: p.fabric_info || '',
      fit_info: p.fit_info || '',
      wash_care: p.wash_care || '',
      short_description: p.short_description || '',
      detailed_description: p.detailed_description || '',
      image_url: p.images?.[0]?.image_url || '',
      design_code: primaryDesign?.design_code || '',
      artwork_url: primaryDesign?.artwork_url || '',
      placement: primaryDesign?.placement || 'front',
      print_width_inches: String(primaryDesign?.print_width_inches || 10),
      print_height_inches: String(primaryDesign?.print_height_inches || 12),
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        size: v.size,
        color_name: v.color_name,
        sku: v.sku,
        qikink_sku: v.qikink_sku || '',
        price_paise: v.price_paise,
      })),
    });
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setSavingEdit(true);
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: editingProduct.id,
          name: editFormData.name,
          category_id: editFormData.category_id || null,
          base_price_paise: parseInt(editFormData.base_price, 10) * 100,
          compare_at_price_paise: parseInt(editFormData.compare_at_price, 10) * 100,
          gst_rate_percentage: parseInt(editFormData.gst_rate_percentage, 10) || 5,
          fabric_info: editFormData.fabric_info,
          fit_info: editFormData.fit_info,
          wash_care: editFormData.wash_care,
          short_description: editFormData.short_description,
          detailed_description: editFormData.detailed_description,
          image_url: editFormData.image_url,
          design_code: editFormData.design_code,
          artwork_url: editFormData.artwork_url,
          placement: editFormData.placement,
          print_width_inches: parseFloat(editFormData.print_width_inches) || 10,
          print_height_inches: parseFloat(editFormData.print_height_inches) || 12,
          variants: editFormData.variants,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: `Product "${editFormData.name}" updated successfully!`, type: 'success' });
        setEditingProduct(null);
        fetchCatalogData();
      } else {
        setMessage({ text: `Failed to update product: ${data.error || 'Server error'}`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error updating product: ${err.message}`, type: 'error' });
    } finally {
      setSavingEdit(false);
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
        setMessage({ text: `Product "${productToDelete.name}" deleted successfully.`, type: 'success' });
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Complete management of products, categories, Qikink Store SKUs, blank garment specs, and 300 DPI print artwork.
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

      {/* Product Table */}
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
                  <th className="py-3 px-4 font-medium">Product & Artwork</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Selling Price</th>
                  <th className="py-3 px-4 font-medium">Sizes & Qikink SKUs</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                {products.map((p) => {
                  const primaryImg = p.images?.[0]?.image_url || '/placeholder.png';
                  const design = p.designs?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-[#F7F6F2]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#EFECE6] relative rounded-sm overflow-hidden flex-shrink-0 border border-[#E8E5DF]">
                            <Image
                              src={primaryImg}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#171717] block text-sm">{p.name}</span>
                            <span className="text-[11px] text-[#77736C] font-mono block">{p.slug}</span>
                            {design && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs inline-block mt-0.5 font-mono">
                                Design: {design.design_code}
                              </span>
                            )}
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
                        {p.compare_at_price_paise && p.compare_at_price_paise > p.base_price_paise && (
                          <span className="text-[10px] text-[#77736C] line-through block font-normal">
                            ₹{(p.compare_at_price_paise / 100).toFixed(0)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {p.variants?.slice(0, 3).map((v) => (
                            <div key={v.id || v.sku} className="text-[11px] flex items-center gap-1.5">
                              <span className="font-bold text-[#171717]">{v.size}:</span>
                              <span className="font-mono text-[#77736C] bg-[#EFECE6] px-1 rounded-xs text-[10px]">
                                {v.qikink_sku || v.sku}
                              </span>
                            </div>
                          ))}
                          {(p.variants?.length || 0) > 3 && (
                            <span className="text-[10px] text-[#77736C] italic block">
                              +{p.variants.length - 3} more sizes
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
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="border border-[#171717] bg-white text-[#171717] hover:bg-[#F7F6F2] px-2.5 py-1 rounded-sm text-[11px] font-semibold inline-flex items-center gap-1"
                          title="Edit product details, descriptions, images, and Qikink SKUs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
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

      {/* Edit Product & Specifications Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full p-6 space-y-4 border border-[#E8E5DF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
                  Edit Product: {editingProduct.name}
                </h2>
                <p className="text-xs text-[#77736C]">Update pricing, descriptions, Qikink design codes, and variant SKUs.</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-[#77736C] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Category</label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  >
                    <option value="">-- Unassigned --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">GST Rate (%)</label>
                  <select
                    value={editFormData.gst_rate_percentage}
                    onChange={(e) => setEditFormData({ ...editFormData, gst_rate_percentage: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  >
                    <option value="5">5% (Apparel below ₹1000)</option>
                    <option value="12">12% (Apparel above ₹1000)</option>
                    <option value="18">18% (Accessories / Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editFormData.base_price}
                    onChange={(e) => setEditFormData({ ...editFormData, base_price: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">MRP / Compare At (₹)</label>
                  <input
                    type="number"
                    value={editFormData.compare_at_price}
                    onChange={(e) => setEditFormData({ ...editFormData, compare_at_price: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Fabric & GSM</label>
                  <input
                    type="text"
                    value={editFormData.fabric_info}
                    onChange={(e) => setEditFormData({ ...editFormData, fabric_info: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Fit Specification</label>
                  <input
                    type="text"
                    value={editFormData.fit_info}
                    onChange={(e) => setEditFormData({ ...editFormData, fit_info: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Wash & Care Instructions</label>
                  <input
                    type="text"
                    value={editFormData.wash_care}
                    onChange={(e) => setEditFormData({ ...editFormData, wash_care: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editFormData.short_description}
                    onChange={(e) => setEditFormData({ ...editFormData, short_description: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Mockup Image URL</label>
                  <input
                    type="url"
                    value={editFormData.image_url}
                    onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                    className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              {/* Qikink Design Specs */}
              <div className="border-t border-[#E8E5DF] pt-3 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Qikink Design & Artwork Specification</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#171717] font-semibold mb-1">
                      Qikink Design SKU / Design Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. pngtreebigdreamactiontshirtdesignpngimage_2994312"
                      value={editFormData.design_code}
                      onChange={(e) => setEditFormData({ ...editFormData, design_code: e.target.value })}
                      className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#171717] font-semibold mb-1">Print Placement</label>
                    <select
                      value={editFormData.placement}
                      onChange={(e) => setEditFormData({ ...editFormData, placement: e.target.value })}
                      className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                    >
                      <option value="front">Front Center</option>
                      <option value="back">Back Center</option>
                      <option value="left_pocket">Left Pocket / Chest</option>
                      <option value="all_over">Full Surface</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#171717] font-semibold mb-1">
                      Print-Ready 300 DPI Artwork URL (Lossless PNG)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editFormData.artwork_url}
                      onChange={(e) => setEditFormData({ ...editFormData, artwork_url: e.target.value })}
                      className="w-full p-2 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                    />
                  </div>
                </div>
              </div>

              {/* Variant SKUs */}
              <div className="border-t border-[#E8E5DF] pt-3 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Variant SKUs & Qikink Store SKUs
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editFormData.variants?.map((v: any, idx: number) => (
                    <div key={v.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-[#F7F6F2] rounded-sm items-center">
                      <div className="font-bold text-[#171717]">Size: {v.size}</div>
                      <div>
                        <input
                          type="text"
                          value={v.sku}
                          placeholder="Internal SKU"
                          onChange={(e) => {
                            const updated = [...editFormData.variants];
                            updated[idx].sku = e.target.value;
                            setEditFormData({ ...editFormData, variants: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-[#D5D1C8] rounded-sm font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={v.qikink_sku || ''}
                          placeholder="Qikink Store SKU (v-9R6o1...)"
                          onChange={(e) => {
                            const updated = [...editFormData.variants];
                            updated[idx].qikink_sku = e.target.value;
                            setEditFormData({ ...editFormData, variants: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-black rounded-sm font-mono text-[11px] font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-[#171717] text-white px-4 py-2 rounded-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-50"
                >
                  {savingEdit ? 'Updating Product...' : 'Save Product Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full p-6 space-y-4 border border-[#E8E5DF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
                  Add Apparel Product, Designs & SKUs
                </h2>
                <p className="text-xs text-[#77736C]">Complete product authoring with instant Qikink POD synchronization.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#77736C] hover:text-[#171717] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Unisex Oversized Heavyweight Jersey"
                    value={newName}
                    onChange={(e) => handleNameChange(e.target.value)}
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
                    <option value="">-- Select a Category (or Unassigned) --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Color Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., White, Washed Black"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

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

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">GST Rate (%)</label>
                  <select
                    value={newGstRate}
                    onChange={(e) => setNewGstRate(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  >
                    <option value="5">5% (Apparel below ₹1000)</option>
                    <option value="12">12% (Apparel above ₹1000)</option>
                    <option value="18">18% (Accessories / Other)</option>
                  </select>
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
                  <label className="block text-[#171717] font-semibold mb-1">Fit Specification</label>
                  <input
                    type="text"
                    value={newFit}
                    onChange={(e) => setNewFit(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Wash & Care Instructions</label>
                  <input
                    type="text"
                    value={newWashCare}
                    onChange={(e) => setNewWashCare(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief description for product cards..."
                    value={newShortDesc}
                    onChange={(e) => setNewShortDesc(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#171717] font-semibold mb-1">Product Mockup Image URL *</label>
                  <input
                    type="url"
                    required
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              {/* Qikink Design Specs Section */}
              <div className="border-t border-[#E8E5DF] pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                    Qikink Design SKU & Print Artwork
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#171717] font-semibold mb-1">
                      Qikink Design SKU / Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. pngtreebigdreamactiontshirtdesignpngimage_2994312"
                      value={newDesignCode}
                      onChange={(e) => setNewDesignCode(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[#171717] font-semibold mb-1">Print Placement</label>
                    <select
                      value={newPlacement}
                      onChange={(e) => setNewPlacement(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                    >
                      <option value="front">Front Center</option>
                      <option value="back">Back Center</option>
                      <option value="left_pocket">Left Chest / Pocket</option>
                      <option value="all_over">Full Surface</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#171717] font-semibold mb-1">
                      Print-Ready 300 DPI Artwork URL (PNG)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newArtworkUrl}
                      onChange={(e) => setNewArtworkUrl(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
                    />
                  </div>
                </div>
              </div>

              {/* Size Variants & SKUs Section */}
              <div className="border-t border-[#E8E5DF] pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Size Variants & Qikink Store SKUs
                    </h3>
                    <p className="text-[11px] text-[#77736C]">
                      Enter your Qikink Store SKU (e.g. `v-9R6o1...`) or Blank SKU (`UOsJsRnHs-Wh-XS`) for each size.
                    </p>
                  </div>

                  {/* Autofill Pattern Helper */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <input
                      type="text"
                      placeholder="Autofill prefix (e.g. UOsJsRnHs-Wh)"
                      value={qikinkPattern}
                      onChange={(e) => setQikinkPattern(e.target.value)}
                      className="p-1.5 text-[11px] border border-[#D5D1C8] rounded-sm font-mono w-48"
                    />
                    <button
                      type="button"
                      onClick={handleApplyQikinkPattern}
                      className="px-2 py-1.5 bg-[#EFECE6] hover:bg-[#D5D1C8] rounded-sm text-[11px] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Table of size inputs */}
                <div className="border border-[#E8E5DF] rounded-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F6F2] text-[#77736C] border-b border-[#E8E5DF]">
                      <tr>
                        <th className="p-2 w-16">Active</th>
                        <th className="p-2 w-16">Size</th>
                        <th className="p-2">Store SKU (Internal)</th>
                        <th className="p-2">Qikink Store SKU / Blank SKU *</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF]">
                      {variantInputs.map((v, idx) => (
                        <tr key={v.size} className={v.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={v.enabled}
                              onChange={(e) => {
                                const updated = [...variantInputs];
                                updated[idx].enabled = e.target.checked;
                                setVariantInputs(updated);
                              }}
                              className="rounded-xs cursor-pointer"
                            />
                          </td>
                          <td className="p-2 font-bold text-[#171717]">{v.size}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              disabled={!v.enabled}
                              value={v.sku}
                              onChange={(e) => {
                                const updated = [...variantInputs];
                                updated[idx].sku = e.target.value;
                                setVariantInputs(updated);
                              }}
                              placeholder={`IMX-SKU-${v.size}`}
                              className="w-full p-1.5 bg-white border border-[#D5D1C8] rounded-sm font-mono text-[11px] disabled:bg-gray-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              disabled={!v.enabled}
                              value={v.qikink_sku}
                              onChange={(e) => {
                                const updated = [...variantInputs];
                                updated[idx].qikink_sku = e.target.value;
                                setVariantInputs(updated);
                              }}
                              placeholder="e.g. v-9R6o1iePaVZW1sYHMBcpubfWqQ7W-Haf or UOsJsRnHs-Wh-S"
                              className="w-full p-1.5 bg-white border border-black rounded-sm font-mono text-[11px] font-semibold disabled:bg-gray-100 disabled:border-[#D5D1C8]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
