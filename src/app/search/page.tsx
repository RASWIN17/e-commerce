'use client';

import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, X, RefreshCw } from 'lucide-react';
import { getProducts } from '../../lib/catalog';
import { Product } from '../../lib/types';
import ProductCard from '../../components/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllProducts() {
      try {
        setLoading(true);
        const prods = await getProducts();
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products for search:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllProducts();
  }, []);

  const searchResults = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.short_description.toLowerCase().includes(q) ||
      p.fabric_info.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center text-[#171717] tracking-tight">
          Search the Collection
        </h1>
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, fabric, style..."
            className="w-full bg-white border border-[#D5D1C8] pl-11 pr-10 py-3 text-sm text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm shadow-subtle"
          />
          <SearchIcon className="w-5 h-5 text-[#77736C] absolute left-3.5 top-3.5" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-[#77736C] hover:text-[#171717]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="border-b border-[#E8E5DF] pb-4 flex items-center justify-between text-xs text-[#77736C]">
        <span>
          Showing {searchResults.length} {searchResults.length === 1 ? 'item' : 'items'}
          {query ? ` for "${query}"` : ''}
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#77736C] space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
          <p>Searching inventory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {!loading && searchResults.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-sm font-semibold text-[#171717]">No products matched your search.</p>
          <p className="text-xs text-[#77736C]">Try searching for &quot;Tee&quot;, &quot;Heavyweight&quot;, or &quot;Hoodie&quot;.</p>
        </div>
      )}
    </div>
  );
}
