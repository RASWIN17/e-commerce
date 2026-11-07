'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '../../lib/catalog';
import { Product } from '../../lib/types';
import ProductCard from '../../components/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        setLoading(true);
        const allProds = await getProducts();
        const savedIds = JSON.parse(localStorage.getItem('imagix_wishlist') || '[]');

        if (Array.isArray(savedIds) && savedIds.length > 0) {
          setWishlistProducts(allProds.filter((p) => savedIds.includes(p.id)));
        } else {
          setWishlistProducts([]);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

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

      {loading ? (
        <div className="py-20 text-center text-xs text-[#77736C]">Loading saved items...</div>
      ) : wishlistProducts.length === 0 ? (
        <div className="bg-white border border-[#E8E5DF] p-12 rounded-sm text-center space-y-4">
          <Heart className="w-10 h-10 text-[#D5D1C8] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#171717]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#77736C]">
              Explore our heavyweights, tailored tees, and everyday accessories to save your favorites.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-block bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#2A2A2A]"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {wishlistProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
