'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SAMPLE_PRODUCTS } from '../../../lib/data/sampleProducts';
import { Plus, Edit3, Trash2, Eye, CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('799');
  const [newComparePrice, setNewComparePrice] = useState('1199');
  const [newFabric, setNewFabric] = useState('100% Combed Compact Cotton, 240 GSM');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProd = {
      id: `prod-${Date.now()}`,
      name: newName,
      slug,
      short_description: 'Heavyweight organic cotton tee tailored for boxy minimal drape.',
      detailed_description: 'Handcrafted in Tirupur from 240 GSM combed compact cotton.',
      fabric_info: newFabric,
      fit_info: 'Oversized boxy fit',
      wash_care: 'Cold wash, wash inside out.',
      base_price_paise: parseInt(newPrice, 10) * 100,
      compare_at_price_paise: parseInt(newComparePrice, 10) * 100,
      prior_30d_price_paise: parseInt(newComparePrice, 10) * 100,
      gst_rate_percentage: 5,
      is_featured: false,
      is_active: true,
      images: [
        {
          id: `img-${Date.now()}`,
          product_id: `prod-${Date.now()}`,
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
          alt_text: newName,
          display_order: 1,
          is_primary: true,
          view_type: 'front' as const,
        },
      ],
      variants: [
        {
          id: `var-${Date.now()}-1`,
          product_id: `prod-${Date.now()}`,
          sku: `IMX-${slug.slice(0, 3).toUpperCase()}-S`,
          color_name: 'Washed Black',
          color_hex: '#1E1E1E',
          size: 'S',
          price_paise: parseInt(newPrice, 10) * 100,
          compare_at_price_paise: parseInt(newComparePrice, 10) * 100,
          qikink_sku: `QIK-OVTEE-BLK-S`,
          stock_quantity: 50,
          is_active: true,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts([newProd, ...products]);
    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Manage your store apparel, pricing, CPA prior-price rules, and inventory.
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

      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Prior 30-Day</th>
                <th className="py-3 px-4 font-medium">GST</th>
                <th className="py-3 px-4 font-medium">Variants</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative w-10 h-12 rounded-sm overflow-hidden bg-[#EFECE6] flex-shrink-0">
                      <Image src={p.images[0]?.image_url || ''} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#171717] block">{p.name}</span>
                      <span className="text-[11px] text-[#77736C]">{p.fabric_info.split(',')[0]}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#171717]">
                    ₹{(p.base_price_paise / 100).toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-[#77736C]">
                    ₹{((p.prior_30d_price_paise || p.base_price_paise) / 100).toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-[#77736C]">{p.gst_rate_percentage}%</td>
                  <td className="py-3 px-4">{p.variants.length} active</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Published
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="text-[#77736C] hover:text-[#171717] p-1 inline-block"
                      title="View on site"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 rounded-sm max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-[#171717]">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Product Name (e.g. Kyoto Sunset Tee)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  required
                  placeholder="Price (₹)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                />
                <input
                  type="number"
                  placeholder="Compare MRP (₹)"
                  value={newComparePrice}
                  onChange={(e) => setNewComparePrice(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Fabric Details"
                value={newFabric}
                onChange={(e) => setNewFabric(e.target.value)}
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
                <button type="submit" className="px-4 py-2 bg-[#171717] text-white rounded-sm font-semibold">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

