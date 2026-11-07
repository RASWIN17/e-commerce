import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SAMPLE_CATEGORIES } from '../../lib/data/sampleProducts';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Product Categories</h1>
        <p className="text-sm text-[#77736C] mt-1">
          Explore our product catalog categorized by apparel and lifestyle essentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SAMPLE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group block space-y-3"
          >
            <div className="relative aspect-[4/3] bg-[#EFECE6] rounded-sm overflow-hidden">
              <Image
                src={cat.image_url || ''}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#171717] tracking-wide group-hover:underline">
                  {cat.name}
                </h2>
                <ArrowRight className="w-4 h-4 text-[#171717] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#77736C] mt-1 leading-relaxed">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

