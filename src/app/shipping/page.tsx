import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Shipping and Delivery Policy
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Effective: November 2026 | Serving all serviceable Indian PIN codes
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Production & Dispatch Windows</h2>
          <p>
            Because IMAGIX produces tailored print-on-demand streetwear in collaboration with our manufacturing hub in Tirupur, delivery involves two distinct stages:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stage 1 — DTG Print Production:</strong> 2 to 3 business days for garment inspection, digital pretreatment, printing, curing, and packaging.</li>
            <li><strong>Stage 2 — Courier Transit:</strong> 1 to 4 business days depending upon geographical distance from Tirupur.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Shipping Charges & Free Shipping Threshold</h2>
          <p>
            We offer <strong>Free Express Shipping</strong> across India on all orders of ₹999 and above. For orders below ₹999, a nominal flat express shipping fee of ₹99 is applied at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Courier Partners & Tracking</h2>
          <p>
            Shipments are routed through premier Indian logistics providers including Bluedart, Delhivery, and Xpressbees. Customers receive live SMS notifications and real-time tracking links upon package dispatch. You may also track any order via our{' '}
            <Link href="/account/orders" className="underline text-[#171717]">
              Order Tracking portal
            </Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">4. Undeliverable Shipments & Address Accuracy</h2>
          <p>
            Customers are responsible for providing an accurate 6-digit PIN code and reachable mobile number. If a package is returned due to incorrect address or repeated customer unavailability, our support desk will contact you to coordinate re-dispatch.
          </p>
        </section>
      </div>
    </div>
  );
}

