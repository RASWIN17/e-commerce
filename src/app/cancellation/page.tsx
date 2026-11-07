import React from 'react';
import Link from 'next/link';

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Cancellation Policy</h1>
        <p className="text-xs text-[#77736C] mt-1">Effective: November 2026</p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Customer-Initiated Cancellation Window</h2>
          <p>
            Because every IMAGIX item is custom-printed to order upon receipt, print jobs are automatically queued to our Tirupur facility shortly after Cashfree payment confirmation.
          </p>
          <p>
            You may cancel your order free of charge within <strong>2 hours of order placement</strong> by contacting customer support at <strong>care@imagix.in</strong> or via your account portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Cancellation After Production Commencement</h2>
          <p>
            Once a garment enters active pre-treatment or digital printing, the custom production process cannot be halted. Orders in &quot;In Production&quot; or &quot;Dispatched&quot; status cannot be cancelled. However, you remain fully protected under our{' '}
            <Link href="/returns" className="underline text-[#171717]">
              Defective & Replacement Policy
            </Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Refund Timeline on Cancellation</h2>
          <p>
            Approved cancellations are refunded to the original payment source (UPI, Debit Card, Credit Card) via the Cashfree Payments API within 3 to 5 business days.
          </p>
        </section>
      </div>
    </div>
  );
}

