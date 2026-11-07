'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getCategoryBySlug, getProductsByCategory } from '../../../lib/catalog';
import { Category, Product } from '../../../lib/types';
import ProductCard from '../../../components/ProductCard';
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true);
        const cat = await getCategoryBySlug(resolvedParams.slug);
        if (cat) {
          setCategory(cat);
          const prods = await getProductsByCategory(cat.id);
          setProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load category:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Loading category collection...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#D5D1C8] mx-auto" />
        <h1 className="text-xl font-bold text-[#171717]">Category Not Found</h1>
        <p className="text-xs text-[#77736C]">The category you are looking for does not exist.</p>
        <Link
          href="/categories"
          className="inline-block bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-sm"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C]">
        <Link href="/" className="hover:text-[#171717]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/categories" className="hover:text-[#171717]">Categories</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium">{category.name}</span>
      </nav>

      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">{category.name}</h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-[#77736C] mt-1">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#77736C] space-y-2">
          <p>No products currently available in this category.</p>
          <Link href="/shop" className="underline font-medium text-[#171717]">
            View all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
