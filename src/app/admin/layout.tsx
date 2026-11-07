'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  MessageSquare,
  AlertTriangle,
  Settings,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Qikink Design Mappings', href: '/admin/qikink-designs', icon: Layers },
    { label: 'Orders & Fulfilment', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
    { label: 'Reviews & Feedback', href: '/admin/feedback', icon: MessageSquare },
    { label: 'Consumer Grievances', href: '/admin/grievances', icon: AlertTriangle },
    { label: 'Business Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E5DF] flex flex-col justify-between p-4 flex-shrink-0 hidden md:flex">
        <div className="space-y-6">
          <div className="px-2 pt-2">
            <Link href="/" className="text-lg font-bold tracking-[0.2em] text-[#171717] uppercase block">
              IMAGIX
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm mt-1 inline-block">
              Admin Console
            </span>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${
                    isActive
                      ? 'bg-[#171717] text-white font-semibold'
                      : 'text-[#77736C] hover:bg-[#F7F6F2] hover:text-[#171717]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E8E5DF] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#77736C] hover:text-[#171717] px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

