import React from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How long does production and delivery take?',
      a: 'Every IMAGIX product is custom-printed to order at our Tirupur facility using high-definition DTG (Direct-to-Garment) technology. Production takes 2–3 business days. Once dispatched, express transit takes 1–4 days depending on your PIN code. You can check exact dates using the PIN code checker on any product page.',
    },
    {
      q: 'What is your return, refund and replacement policy?',
      a: 'Because products are printed on-demand, we cannot accept returns for subjective change of mind. However, if your product arrives damaged, misprinted, with manufacturing defects, or if an incorrect size was shipped by us, we provide a 100% free doorstep replacement or complete refund within 7 days of delivery.',
    },
    {
      q: 'Are your payment gateways secure?',
      a: 'Yes. All payments on IMAGIX are processed through Cashfree Payments with 256-bit PCI-DSS compliant encryption. We support UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking. We never store or log your card numbers or CVV.',
    },
    {
      q: 'How do I care for my heavyweight DTG printed tees?',
      a: 'To maximize print vibrancy and garment longevity, machine wash inside-out in cold water (30°C) with mild detergent. Do not bleach. Air dry in shade or tumble dry on low. Never iron directly on the printed graphic.',
    },
    {
      q: 'Is Cash on Delivery (COD) available?',
      a: 'To minimize print-on-demand returns and avoid unclaimed personalized stock, we currently prioritize prepaid transactions. We periodically evaluate COD for serviceable metro PIN codes.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#77736C] mt-1">
          Everything you need to know about our products, DTG print craftsmanship, delivery, and policies.
        </p>
      </div>

      <div className="divide-y divide-[#E8E5DF] bg-white border border-[#E8E5DF] rounded-sm p-6 sm:p-8 shadow-subtle">
        {faqs.map((f, i) => (
          <div key={i} className="py-5 first:pt-0 last:pb-0 space-y-2">
            <h2 className="text-sm font-bold text-[#171717]">{f.q}</h2>
            <p className="text-xs text-[#77736C] leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-[#77736C] pt-4">
        Still have questions? Reach out directly via our{' '}
        <Link href="/contact" className="font-semibold text-[#171717] underline">
          Contact Desk
        </Link>{' '}
        or call <span className="font-semibold text-[#171717]">+91 80 4718 9000</span>.
      </div>
    </div>
  );
}

