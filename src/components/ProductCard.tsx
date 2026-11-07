'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../lib/types';
import { useCart } from '../lib/cart-context';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const primaryImage = product.images[0]?.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518';
  const defaultVariant = product.variants[0];

  return (
    <div className="group flex flex-col">
      {/* Product Image Frame */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] bg-[#EFECE6] overflow-hidden rounded-sm block"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
        />

        {/* Quick add badge on hover */}
        {defaultVariant && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product, defaultVariant, 1);
            }}
            className="absolute bottom-3 inset-x-3 bg-white/95 text-[#171717] py-2 text-xs font-medium tracking-wide shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#171717] hover:text-white"
          >
            + Quick Add ({defaultVariant.size})
          </button>
        )}
      </Link>

      {/* Product Metadata */}
      <div className="pt-3 flex flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-[#171717] hover:underline truncate"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-[#171717]">
            ₹{(product.base_price_paise / 100).toFixed(0)}
          </span>
          {product.compare_at_price_paise && product.compare_at_price_paise > product.base_price_paise && (
            <span className="text-xs text-[#77736C] line-through">
              ₹{(product.compare_at_price_paise / 100).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

