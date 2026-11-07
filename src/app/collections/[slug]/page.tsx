'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCollectionBySlug, getProductsByCollection } from '../../../lib/catalog';
import { Collection, Product } from '../../../lib/types';
import ProductCard from '../../../components/ProductCard';
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollectionData() {
      try {
        setLoading(true);
        const col = await getCollectionBySlug(resolvedParams.slug);
        if (col) {
          setCollection(col);
          const prods = await getProductsByCollection(col.id);
          setProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load collection:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCollectionData();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p className="text-xs text-[#77736C]">Loading collection capsule...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#D5D1C8] mx-auto" />
        <h1 className="text-xl font-bold text-[#171717]">Collection Not Found</h1>
        <p className="text-xs text-[#77736C]">The collection you are looking for does not exist.</p>
        <Link
          href="/collections"
          className="inline-block bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-sm"
        >
          View All Collections
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
        <Link href="/collections" className="hover:text-[#171717]">Collections</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#171717] font-medium">{collection.name}</span>
      </nav>

      {/* Banner */}
      <div className="relative h-64 sm:h-80 bg-[#EFECE6] rounded-sm overflow-hidden flex items-end p-8">
        {collection.banner_url && (
          <Image
            src={collection.banner_url}
            alt={collection.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative text-white space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">{collection.description}</p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#77736C] space-y-2">
          <p>No products currently linked to this collection capsule.</p>
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
