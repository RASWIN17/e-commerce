'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Check,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getProductBySlug, getProducts } from '../../../lib/catalog';
import { Product } from '../../../lib/types';
import { useCart } from '../../../lib/cart-context';
import PincodeChecker from '../../../components/PincodeChecker';
import SizeGuideModal from '../../../components/SizeGuideModal';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const [prod, allProds] = await Promise.all([
          getProductBySlug(resolvedParams.slug),
          getProducts(),
        ]);

        if (prod) {
          setProduct(prod);
          const firstVar = prod.variants?.[0];
          setSelectedColor(firstVar?.color_name || '');
          setSelectedSize(firstVar?.size || '');
          setRelatedProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#D5D1C8] mx-auto" />
        <h1 className="text-xl font-bold text-[#171717]">Product Not Found</h1>
        <p className="text-xs text-[#77736C]">
          The product you are looking for does not exist or has been archived.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#2A2A2A]"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const selectedVariant =
    variants.find((v) => v.color_name === selectedColor && v.size === selectedSize) ||
    variants[0] ||
    ({ price_paise: product.base_price_paise, sku: 'DEFAULT', size: 'M', color_name: 'Standard' } as any);

  const uniqueColors = Array.from(
    new Set(variants.map((v) => JSON.stringify({ name: v.color_name, hex: v.color_hex })))
  ).map((s) => JSON.parse(s));

  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'ph', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop', alt_text: product.name }];

  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C]">
        <Link href="/" className="hover:text-[#171717]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-[#171717]">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-[#EFECE6] rounded-sm overflow-hidden">
            <Image
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-[4/5] bg-[#EFECE6] rounded-sm overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-[#171717]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-[#E8E5DF] pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              {product.name}
            </h1>
            <p className="text-xs text-[#77736C] leading-relaxed">
              {product.short_description}
            </p>

            {/* CPA Prior Price Compliance & Taxes */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#171717]">
                ₹{(selectedVariant.price_paise / 100).toFixed(0)}
              </span>
              {product.compare_at_price_paise && (
                <span className="text-xs line-through text-[#77736C]">
                  ₹{(product.compare_at_price_paise / 100).toFixed(0)}
                </span>
              )}
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
                Inclusive of all taxes ({product.gst_rate_percentage}% GST)
              </span>
            </div>
          </div>

          {/* Color Selector */}
          {uniqueColors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">Color:</span>
                <span className="text-[#77736C]">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-2">
                {uniqueColors.map((col: any) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === col.name ? 'border-[#171717] scale-110' : 'border-[#D5D1C8]'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                    aria-label={`Select ${col.name} color`}
                  >
                    {selectedColor === col.name && (
                      <Check className={`w-3.5 h-3.5 ${col.hex.toLowerCase() === '#ffffff' || col.hex.toLowerCase() === '#f5f4ee' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {uniqueSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">Select Size:</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-[#171717] underline hover:text-[#77736C] flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {uniqueSizes.map((sz: string) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 text-xs font-semibold uppercase rounded-sm border transition-all ${
                      selectedSize === sz
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-white text-[#171717] border-[#D5D1C8] hover:border-[#171717]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D5D1C8] rounded-sm bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-[#171717] hover:bg-[#F7F6F2] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-semibold text-[#171717]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="p-2.5 text-[#171717] hover:bg-[#F7F6F2] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#171717] text-white py-3 px-6 text-xs uppercase tracking-widest font-semibold hover:bg-[#2A2A2A] transition-colors rounded-sm shadow-sm"
              >
                Add to Bag
              </button>
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="pt-2">
            <PincodeChecker />
          </div>

          {/* Product Specifications Accordion / Tabs */}
          <div className="border-t border-[#E8E5DF] pt-6 space-y-4">
            <div className="flex items-center gap-6 border-b border-[#E8E5DF] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-[#171717] text-[#171717]'
                    : 'text-[#77736C] hover:text-[#171717]'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('fabric')}
                className={`pb-2 transition-colors ${
                  activeTab === 'fabric'
                    ? 'border-b-2 border-[#171717] text-[#171717]'
                    : 'text-[#77736C] hover:text-[#171717]'
                }`}
              >
                Fabric & Fit
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 transition-colors ${
                  activeTab === 'shipping'
                    ? 'border-b-2 border-[#171717] text-[#171717]'
                    : 'text-[#77736C] hover:text-[#171717]'
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="text-xs text-[#77736C] leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>{product.detailed_description}</p>
                  <p className="text-[#171717] font-medium">SKU: {selectedVariant.sku}</p>
                </div>
              )}
              {activeTab === 'fabric' && (
                <div className="space-y-2">
                  <p><strong className="text-[#171717]">Fabric:</strong> {product.fabric_info}</p>
                  <p><strong className="text-[#171717]">Fit:</strong> {product.fit_info}</p>
                  <p><strong className="text-[#171717]">Wash Care:</strong> {product.wash_care}</p>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-2">
                  <p>Every piece is custom printed on-demand at our Tirupur facility to prevent deadstock and textile waste.</p>
                  <p>• DTG Print & Quality Inspection: 2–3 business days.</p>
                  <p>• Courier Delivery: 2–4 business days via Bluedart / Delhivery.</p>
                  <p>• In case of transit damage, print flaw or wrong item delivered, we arrange a free doorstep replacement within 7 days.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#E8E5DF] space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E8E5DF] p-3 px-4 z-30 flex items-center justify-between gap-4 shadow-elevated">
        <div>
          <span className="text-sm font-bold text-[#171717]">
            ₹{(selectedVariant.price_paise / 100).toFixed(0)}
          </span>
          <p className="text-[10px] text-[#77736C]">Size: {selectedSize}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-[#171717] text-white py-2.5 px-6 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm"
        >
          Add to Bag
        </button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
