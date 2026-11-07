'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProducts, getCategories } from '../../lib/catalog';
import { Product, Category } from '../../lib/types';
import ProductCard from '../../components/ProductCard';
import { ChevronRight } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        const [pData, cData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(pData);
        setCategories(cData);
      } catch (e) {
        console.error('Failed to load shop data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, []);

  const filteredProducts = products
    .filter((prod) => {
      if (selectedCategory === 'all') return true;
      return prod.category_id === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.base_price_paise - b.base_price_paise;
      if (sortBy === 'price-desc') return b.base_price_paise - a.base_price_paise;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C]">
        <Link href="/" className="hover:text-[#171717]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium">Shop All</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E5DF] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Shop Collection</h1>
          <p className="text-sm text-[#77736C] mt-1">
            Carefully curated heavyweights, tailored essentials, and print-on-demand artwork.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#77736C]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 font-medium text-[#171717] focus:outline-none cursor-pointer pr-4"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-medium ${
            selectedCategory === 'all'
              ? 'bg-[#171717] text-white border-[#171717]'
              : 'bg-white border-[#E8E5DF] text-[#171717] hover:border-[#77736C]'
          }`}
        >
          All Products ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap font-medium ${
              selectedCategory === cat.id
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white border-[#E8E5DF] text-[#171717] hover:border-[#77736C]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#77736C]">
          Loading collection...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm text-[#77736C]">No products found in this category.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs uppercase font-semibold text-[#171717] underline"
          >
            View All Products
          </button>
        </div>
      )}
    </div>
  );
}
