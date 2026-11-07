import React from 'react';
import Link from 'next/link';
import { Instagram, Youtube, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F7F6F2] border-t border-[#E8E5DF] pt-12 pb-10 text-xs text-[#77736C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E8E5DF]">
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.2em] text-[#171717] uppercase"
          >
            IMAGIX
          </Link>

          {/* Links matching the screenshot */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#171717]">
            <Link href="/shop" className="hover:text-[#77736C] transition-colors">
              Shop
            </Link>
            <Link href="/about" className="hover:text-[#77736C] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#77736C] transition-colors">
              Contact
            </Link>
            <Link href="/shipping" className="hover:text-[#77736C] transition-colors">
              Shipping
            </Link>
            <Link href="/returns" className="hover:text-[#77736C] transition-colors">
              Returns
            </Link>
            <Link href="/privacy" className="hover:text-[#77736C] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#77736C] transition-colors">
              Terms
            </Link>
            <Link href="/grievance" className="hover:text-[#77736C] transition-colors">
              Grievance
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-[#171717]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-[#77736C] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-[#77736C] transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-[#77736C] transition-colors"
              aria-label="Pinterest"
            >
              {/* Pinterest icon SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.48.02-3.55l.9-3.83s-.23-.46-.23-1.14c0-1.07.62-1.87 1.4-1.87.66 0 .98.5 0 .98 1.1 0 1.02-.65 2.54-.99 3.95-.27 1.16.58 2.1 1.72 2.1 2.07 0 3.66-2.18 3.66-5.33 0-2.79-2-4.74-4.86-4.74-3.31 0-5.25 2.48-5.25 5.05 0 1 .39 2.07.87 2.65.1.11.11.21.08.33l-.33 1.35c-.05.21-.17.26-.4.16-1.5-.7-2.44-2.88-2.44-4.64 0-3.78 2.75-7.25 7.92-7.25 4.16 0 7.39 2.96 7.39 6.92 0 4.13-2.6 7.45-6.22 7.45-1.21 0-2.36-.63-2.75-1.38l-.75 2.86c-.27 1.05-1 2.37-1.49 3.17A12 12 0 1 0 12 0z" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-[#77736C] transition-colors"
              aria-label="X"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Legal Metrology & Statutory Declarations */}
        <div className="pt-6 pb-4 flex flex-col md:flex-row items-center justify-between text-[11px] gap-3">
          <p>
            © 2026 IMAGIX Apparel Private Limited. All rights reserved. Country of Origin: India.
          </p>
          <p className="text-center md:text-right">
            Consumer Care: care@imagix.in | Toll-Free: +91 80 4718 9000 | Studio 4B, Tirupur, TN - 641602
          </p>
        </div>
      </div>
    </footer>
  );
}

