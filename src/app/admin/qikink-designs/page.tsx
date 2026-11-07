'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Sliders,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';

interface VariantInfo {
  sku: string;
  qikinkSku: string;
  size: string;
  color: string;
}

interface DesignMapping {
  id: string;
  productName: string;
  blankProduct: string;
  designCode: string;
  placement: string;
  printWidth: number;
  printHeight: number;
  artworkUrl: string;
  mockupUrl: string;
  variants: VariantInfo[];
}

export default function QikinkDesignMappingPage() {
  const [mappings, setMappings] = useState<DesignMapping[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for creating a new design mapping
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesignCode, setNewDesignCode] = useState('');
  const [newBlankProduct, setNewBlankProduct] = useState('Qikink Oversized Heavyweight Cotton Tee (240 GSM)');
  const [newPlacement, setNewPlacement] = useState('front');
  const [newWidth, setNewWidth] = useState(10.0);
  const [newHeight, setNewHeight] = useState(12.0);
  const [newArtworkUrl, setNewArtworkUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [designsRes, productsRes] = await Promise.all([
        fetch('/api/admin/designs'),
        fetch('/api/admin/products'),
      ]);

      if (designsRes.ok && productsRes.ok) {
        const designsData = await designsRes.json();
        const productsData = await productsRes.json();

        const prods = productsData.products || [];
        setProducts(prods);
        if (prods.length > 0 && !selectedProduct) {
          setSelectedProduct(prods[0]);
          setNewDesignCode(`IMX-DES-${prods[0].slug.slice(0, 3).toUpperCase()}-01`);
        }

        const formatted = (designsData.designs || []).map((d: any) => {
          const prod = d.products;
          const variants: VariantInfo[] = (prod?.product_variants || []).map((v: any) => ({
            sku: v.sku,
            qikinkSku: v.qikink_sku || `QIK-${v.sku}`,
            size: v.size,
            color: v.color_name,
          }));

          return {
            id: d.id,
            productName: prod?.name || 'Apparel Product',
            blankProduct: 'Qikink Premium Bio-Washed Apparel',
            designCode: d.design_code,
            placement: d.placement,
            printWidth: d.print_width_inches,
            printHeight: d.print_height_inches,
            artworkUrl: d.artwork_url,
            mockupUrl: d.preview_mockup_url || d.artwork_url,
            variants,
          };
        });

        setMappings(formatted);
      }
    } catch (err) {
      console.error('Error fetching admin designs/products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSelect = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setSelectedProduct(prod);
      setNewDesignCode(`IMX-DES-${prod.slug.slice(0, 3).toUpperCase()}-01`);
    }
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtworkUrl) {
      alert('Please enter or upload the high-resolution artwork URL.');
      return;
    }
    if (!selectedProduct) {
      alert('Please select a product.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          design_code: newDesignCode,
          placement: newPlacement,
          artwork_url: newArtworkUrl,
          preview_mockup_url: selectedProduct.images?.[0]?.image_url || newArtworkUrl,
          print_width_inches: newWidth,
          print_height_inches: newHeight,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateModal(false);
        setSavedSuccess(true);
        setNewArtworkUrl('');
        fetchData();
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(`Error saving design mapping: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
            Qikink Product & Design Mapping System
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Map customer-facing product variants to exact Qikink blanks, high-res print artwork, and placement specs.
          </p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0 && !selectedProduct) {
              setSelectedProduct(products[0]);
              setNewDesignCode(`IMX-DES-${products[0].slug.slice(0, 3).toUpperCase()}-01`);
            }
            setShowCreateModal(true);
          }}
          className="bg-[#171717] text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Design Mapping</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Qikink SKU and Artwork parameters registered in database successfully!</span>
        </div>
      )}

      {/* Critical Architecture Notice */}
      <div className="bg-[#EFECE6] p-4 rounded-sm flex items-start gap-3 text-xs text-[#171717]">
        <Layers className="w-4 h-4 text-[#171717] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block">Separation of Artwork and Customer Mockups:</strong>
          Customer-facing mockup images are optimized for web compression (WebP/AVIF). Actual print files sent to Qikink Open API are full-resolution lossless PNG/JPEG files at 300 DPI with exact width and height dimensions in inches.
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#171717]" />
          <p className="text-xs text-[#77736C] mt-2">Loading design mappings from database...</p>
        </div>
      ) : mappings.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#77736C] bg-white border border-[#E8E5DF] rounded-sm">
          No design mappings found. Click &quot;New Design Mapping&quot; to configure your first artwork spec.
        </div>
      ) : (
        /* Active Mappings List */
        <div className="space-y-6">
          {mappings.map((map) => (
            <div
              key={map.id}
              className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Active Qikink Mapping
                  </span>
                  <h2 className="text-base font-bold text-[#171717] mt-1.5">{map.productName}</h2>
                  <p className="text-xs text-[#77736C]">
                    Blank: <strong className="text-[#171717]">{map.blankProduct}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[#77736C] block">Design Code</span>
                    <span className="font-mono font-semibold text-[#171717]">{map.designCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#77736C] block">Print Area</span>
                    <span className="font-semibold text-[#171717]">
                      {map.printWidth}&quot; × {map.printHeight}&quot; ({map.placement})
                    </span>
                  </div>
                </div>
              </div>

              {/* Split Visual Comparison: Mockup vs Print Artwork */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Customer Mockup */}
                <div className="border border-[#E8E5DF] p-3 rounded-sm bg-[#F7F6F2] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717]">Customer-Facing Mockup</span>
                    <span className="text-[10px] text-[#77736C]">Public Web Store</span>
                  </div>
                  <div className="relative aspect-video rounded-sm overflow-hidden bg-white">
                    <Image src={map.mockupUrl} alt="Mockup" fill className="object-cover" />
                  </div>
                </div>

                {/* High-Res Print Artwork */}
                <div className="border border-[#171717] p-3 rounded-sm bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171717]">High-Res Print-Ready Artwork</span>
                    <span className="text-[10px] font-semibold text-emerald-800">300 DPI / Lossless</span>
                  </div>
                  <div className="relative aspect-video rounded-sm overflow-hidden bg-[#EFECE6] flex items-center justify-center">
                    <Image src={map.artworkUrl} alt="Print Artwork" fill className="object-contain p-2" />
                  </div>
                </div>
              </div>

              {/* Variant SKU to Qikink SKU Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Variant SKU Mapping ({map.variants.length} Sizes)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8E5DF] text-[#77736C]">
                        <th className="py-2">IMAGIX Variant SKU</th>
                        <th className="py-2">Size</th>
                        <th className="py-2">Color</th>
                        <th className="py-2">Qikink Blank SKU</th>
                        <th className="py-2">Automated Routing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
                      {map.variants.map((v, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 font-mono text-[#171717]">{v.sku}</td>
                          <td className="py-2.5">{v.size}</td>
                          <td className="py-2.5">{v.color}</td>
                          <td className="py-2.5 font-mono font-semibold text-emerald-900">{v.qikinkSku}</td>
                          <td className="py-2.5">
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                              ✓ Auto-Dispatched on Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Design Mapping Modal */}
      {showCreateModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 sm:p-8 rounded-sm max-w-xl w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-[#171717] uppercase tracking-wider">
              Register New Qikink Design & SKU Mapping
            </h2>

            <form onSubmit={handleSaveMapping} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Select Product *</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.variants?.length || 0} variants)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">
                  Qikink Blank Garment Specification
                </label>
                <input
                  type="text"
                  value={newBlankProduct}
                  onChange={(e) => setNewBlankProduct(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Design Code *</label>
                  <input
                    type="text"
                    required
                    value={newDesignCode}
                    onChange={(e) => setNewDesignCode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Print Placement</label>
                  <select
                    value={newPlacement}
                    onChange={(e) => setNewPlacement(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                  >
                    <option value="front">Front Center</option>
                    <option value="back">Back Center</option>
                    <option value="left_pocket">Left Chest / Pocket</option>
                    <option value="all_over">Full Surface</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Print Width (Inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWidth}
                    onChange={(e) => setNewWidth(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-semibold mb-1">Print Height (Inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">
                  High-Resolution Print Artwork URL (300 DPI PNG/JPG) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newArtworkUrl}
                  onChange={(e) => setNewArtworkUrl(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-[#171717] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#171717] text-white px-4 py-2 rounded-sm font-semibold uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Mapping in Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
