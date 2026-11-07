'use client';

import React from 'react';
import Link from 'next/link';
import { SAMPLE_PRODUCTS } from '../../lib/data/sampleProducts';
import ProductCard from '../../components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  // Sample wishlist items
  const wishlistProducts = SAMPLE_PRODUCTS.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs text-[#77736C] hover:text-[#171717]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Browsing</span>
      </Link>

      <div className="border-b border-[#E8E5DF] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            My Wishlist ({wishlistProducts.length})
          </h1>
          <p className="text-xs text-[#77736C] mt-1">
            Saved items reserved for your upcoming wardrobe rotation.
          </p>
        </div>
        <Heart className="w-6 h-6 text-[#171717]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {wishlistProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

