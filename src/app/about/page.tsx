import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Feather, Recycle, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      <div className="space-y-4 text-center">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#77736C]">
          The IMAGIX Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717]">
          Wear what feels like you.
        </h1>
        <p className="text-base text-[#77736C] max-w-xl mx-auto leading-relaxed">
          IMAGIX was founded on a simple realization: you don’t need a closet full of loud logos. You need heavyweight, timeless staples cut with architectural precision and printed on demand with zero textile waste.
        </p>
      </div>

      <div className="relative aspect-[16/9] bg-[#EFECE6] rounded-sm overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"
          alt="IMAGIX Studio craftsmanship"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-[#77736C] leading-relaxed">
        <div className="space-y-3 p-6 bg-white border border-[#E8E5DF] rounded-sm">
          <Feather className="w-5 h-5 text-[#171717]" />
          <h2 className="text-sm font-bold text-[#171717]">240 GSM Combed Cotton</h2>
          <p>
            We don’t cut corners with flimsy 140 GSM single jersey. Every IMAGIX tee starts with heavyweight 240 GSM super-combed compact cotton that maintains its boxy structural drape through dozens of wash cycles.
          </p>
        </div>

        <div className="space-y-3 p-6 bg-white border border-[#E8E5DF] rounded-sm">
          <Recycle className="w-5 h-5 text-[#171717]" />
          <h2 className="text-sm font-bold text-[#171717]">Zero-Waste Print-on-Demand</h2>
          <p>
            By partnering directly with state-of-the-art DTG printing hubs in Tirupur, Tamil Nadu, we only produce what is actually ordered. No unsold landfill stock, no artificial obsolescence.
          </p>
        </div>
      </div>

      <div className="bg-[#EFECE6] p-8 rounded-sm text-center space-y-4">
        <h2 className="text-xl font-bold text-[#171717]">Crafted for the modern aesthetic</h2>
        <p className="text-xs text-[#77736C] max-w-md mx-auto">
          Explore our collection of minimal boxy tees, heavyweight winter hoodies, and utilitarian everyday carry.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#171717] text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#2A2A2A] rounded-sm"
        >
          <span>Explore All Drops</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

