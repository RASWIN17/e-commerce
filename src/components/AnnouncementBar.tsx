import React from 'react';
import { Truck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#171717] text-[#F7F6F2] py-2 px-4 text-xs font-medium tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Truck className="w-3.5 h-3.5 opacity-80" />
        <Link href="/shipping" className="hover:underline flex items-center gap-1">
          <span>Free shipping on all orders above ₹999</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </Link>
      </div>
    </div>
  );
}

