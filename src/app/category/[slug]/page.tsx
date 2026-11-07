'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from '../../../lib/data/sampleProducts';
import ProductCard from '../../../components/ProductCard';
import { ChevronRight } from 'lucide-react';

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const category =
    SAMPLE_CATEGORIES.find((c) => c.slug === resolvedParams.slug) || SAMPLE_CATEGORIES[0];

  const products = SAMPLE_PRODUCTS.filter((p) => p.category_id === category.id);

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
        <p className="text-xs sm:text-sm text-[#77736C] mt-1">{category.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

