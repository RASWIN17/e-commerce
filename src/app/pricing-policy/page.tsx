import React from 'react';

export default function PricingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Payment and Pricing Policy
        </h1>
        <p className="text-xs text-[#77736C] mt-1">Compliance with Indian Legal Metrology and GST Laws</p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Transparent MRP & Tax Inclusive Pricing</h2>
          <p>
            In accordance with the Legal Metrology (Packaged Commodities) Rules, 2011, every product listed on IMAGIX displays the Maximum Retail Price (MRP) inclusive of all applicable central and state taxes. No hidden charges or surprise taxes are added at the final payment step.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Goods and Services Tax (GST) Treatment</h2>
          <p>
            GST is accounted for under official HSN code classifications:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Apparel & T-Shirts (HSN 6109):</strong> Taxed at 5% GST for value up to ₹1,000 per piece, and 12% GST for items exceeding ₹1,000.</li>
            <li><strong>Hoodies & Fleece (HSN 6110):</strong> Taxed at 12% GST.</li>
            <li><strong>Tote Bags & Accessories (HSN 4202):</strong> Taxed at 12% GST.</li>
          </ul>
          <p>
            An official GST Tax Invoice containing our GSTIN (33AABCU9603R1ZM) and the customer&apos;s shipping address is generated automatically upon payment completion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Advertising Standards & 30-Day Prior Price Rule</h2>
          <p>
            In compliance with the 2026 amendments to the Consumer Protection (E-Commerce) Rules and ASCI guidelines, any advertised discount or slashed compare-at price is substantiated by our transactional records and reflects the lowest actual retail price offered in the immediate preceding 30 days. We do not artificially inflate baseline prices prior to promotional events.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">4. Payment Gateway Charges</h2>
          <p>
            Payment processing fees charged by our payment gateway partner, Cashfree Payments, are absorbed entirely by IMAGIX. We never levy convenience fees, surcharge fees, or payment processing surcharges on customers.
          </p>
        </section>
      </div>
    </div>
  );
}

