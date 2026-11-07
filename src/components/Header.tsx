'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../lib/cart-context';

export default function Header() {
  const { totalCount, setIsCartDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F7F6F2]/95 backdrop-blur-sm border-b border-[#E8E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo - Replaces THREADS with IMAGIX */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-[#171717] hover:opacity-70 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#171717] uppercase">
            IMAGIX
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#171717]">
          <Link href="/shop" className="hover:text-[#77736C] transition-colors">
            Shop
          </Link>
          <Link href="/collections" className="hover:text-[#77736C] transition-colors">
            Collections
          </Link>
          <Link href="/about" className="hover:text-[#77736C] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#77736C] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-5 text-[#171717]">
          <Link
            href="/search"
            className="p-1 hover:text-[#77736C] transition-colors"
            aria-label="Search catalogue"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            href="/account"
            className="p-1 hover:text-[#77736C] transition-colors"
            aria-label="Account profile"
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="p-1 relative hover:text-[#77736C] transition-colors focus:outline-none"
            aria-label={`Shopping bag with ${totalCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#171717] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F6F2] border-b border-[#E8E5DF] px-6 py-6 space-y-4 text-base font-medium">
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#171717] py-1"
          >
            Shop All Products
          </Link>
          <Link
            href="/collections"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#171717] py-1"
          >
            Collections
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#171717] py-1"
          >
            About IMAGIX
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#171717] py-1"
          >
            Contact & Support
          </Link>
          <div className="pt-4 border-t border-[#E8E5DF] flex flex-col gap-2 text-sm text-[#77736C]">
            <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)}>
              My Orders & Tracking
            </Link>
            <Link href="/grievance" onClick={() => setMobileMenuOpen(false)}>
              Grievance Redressal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

