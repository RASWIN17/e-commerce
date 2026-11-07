'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Check,
  Star,
  Plus,
  Minus,
} from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from '../../../lib/data/sampleProducts';
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

  const product =
    SAMPLE_PRODUCTS.find((p) => p.slug === resolvedParams.slug) || SAMPLE_PRODUCTS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color_name);
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');

  // Match the selected variant
  const selectedVariant =
    product.variants.find(
      (v) => v.color_name === selectedColor && v.size === selectedSize
    ) || product.variants[0];

  // Distinct colors and sizes
  const uniqueColors = Array.from(
    new Set(product.variants.map((v) => JSON.stringify({ name: v.color_name, hex: v.color_hex })))
  ).map((s) => JSON.parse(s));

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
      router.push('/checkout');
    }
  };

  const relatedProducts = SAMPLE_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C]">
        <Link href="/" className="hover:text-[#171717]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-[#171717]">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* LEFT COLUMN: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Large Main Image */}
          <div className="relative aspect-[4/5] bg-[#EFECE6] rounded-sm overflow-hidden border border-[#E8E5DF]">
            <Image
              src={product.images[selectedImageIndex]?.image_url || product.images[0]?.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                    idx === selectedImageIndex ? 'border-[#171717]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.image_url} alt={img.alt_text} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              {product.name}
            </h1>
            <p className="text-sm text-[#77736C] mt-2 leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Pricing with 30-Day Prior Price Compliance */}
          <div className="border-y border-[#E8E5DF] py-4 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#171717]">
                ₹{(selectedVariant.price_paise / 100).toFixed(0)}
              </span>
              {selectedVariant.compare_at_price_paise && (
                <span className="text-base text-[#77736C] line-through">
                  ₹{(selectedVariant.compare_at_price_paise / 100).toFixed(0)}
                </span>
              )}
              {selectedVariant.compare_at_price_paise && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  {Math.round(
                    ((selectedVariant.compare_at_price_paise - selectedVariant.price_paise) /
                      selectedVariant.compare_at_price_paise) *
                      100
                  )}
                  % OFF
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#77736C]">
              MRP inclusive of all taxes (GST 5%). Free shipping on orders above ₹999.
            </p>
            {product.prior_30d_price_paise && (
              <p className="text-[10px] text-[#77736C]">
                * Lowest price offered in past 30 days: ₹{(product.prior_30d_price_paise / 100).toFixed(0)} (CPA 2026 Compliant)
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717]">
              Colour: <span className="text-[#77736C] font-normal">{selectedColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {uniqueColors.map((color: any) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedColor === color.name
                      ? 'border-[#171717] scale-110'
                      : 'border-[#D5D1C8] hover:border-[#77736C]'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColor === color.name && (
                    <Check
                      className={`w-4 h-4 ${
                        color.hex === '#FFFFFF' || color.hex.startsWith('#F') || color.hex.startsWith('#E')
                          ? 'text-[#171717]'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Size: <span className="text-[#77736C] font-normal">{selectedSize}</span>
              </label>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-[#171717] underline hover:text-[#77736C] flex items-center gap-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 text-xs font-semibold border rounded-sm transition-all ${
                    selectedSize === size
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#171717] border-[#D5D1C8] hover:border-[#171717]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#D5D1C8] bg-white rounded-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-[#171717] hover:bg-[#EFECE6]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-medium min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-[#171717] hover:bg-[#EFECE6]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#171717] text-white py-3 px-6 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] transition-colors rounded-sm shadow-sm"
              >
                Add to Bag
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-[#EFECE6] text-[#171717] py-3 text-xs uppercase tracking-wider font-semibold hover:bg-[#E5E0D6] border border-[#D5D1C8] transition-colors rounded-sm"
            >
              Buy Now
            </button>
          </div>

          {/* Delivery & Pincode Checker */}
          <PincodeChecker orderTotalPaise={selectedVariant.price_paise * quantity} />

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#77736C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#171717]" />
              <span>100% Organic Combed Cotton</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#171717]" />
              <span>7-Day Replacement for Defects</span>
            </div>
          </div>

          {/* Product Specifications & Details Tabs */}
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

