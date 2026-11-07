'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SAMPLE_COLLECTIONS, SAMPLE_PRODUCTS } from '../../../lib/data/sampleProducts';
import ProductCard from '../../../components/ProductCard';
import { ChevronRight } from 'lucide-react';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const collection =
    SAMPLE_COLLECTIONS.find((c) => c.slug === resolvedParams.slug) || SAMPLE_COLLECTIONS[0];

  const products = SAMPLE_PRODUCTS.filter((p) => p.collection_id === collection.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#77736C]">
        <Link href="/" className="hover:text-[#171717]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/collections" className="hover:text-[#171717]">Collections</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium">{collection.name}</span>
      </nav>

      {/* Banner */}
      <div className="relative h-64 sm:h-80 bg-[#EFECE6] rounded-sm overflow-hidden flex items-end p-8">
        <Image
          src={collection.banner_url || ''}
          alt={collection.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative text-white space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">{collection.description}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

