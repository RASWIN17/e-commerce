import React from 'react';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Returns, Refunds and Replacement Policy
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          In accordance with the Consumer Protection Act, 2019 and E-Commerce Rules
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Our Quality Guarantee</h2>
          <p>
            At IMAGIX, every garment is inspected before dispatch. Because our items are custom-printed upon order to eliminate landfill waste, we do not accept returns for subjective change of mind. However, we provide complete, hassle-free protection against manufacturing flaws, transit damage, or fulfilment errors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Eligibility for Free Replacement or Full Refund</h2>
          <p>
            You are 100% entitled to a free doorstep replacement or complete refund if:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The product delivered has a manufacturing defect (e.g. stitching flaws, fabric tears).</li>
            <li>The print is noticeably misaligned, peeled, or flawed compared to the approved design.</li>
            <li>You received an incorrect item, wrong size, or wrong color variant compared to your order confirmation.</li>
            <li>The package arrived physically damaged or tampered with during transit.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Reporting Window & Proof</h2>
          <p>
            Please report any defect within <strong>7 days of delivery</strong> by sending an email to <strong>care@imagix.in</strong> with your Order Number and 2 clear photographs of the defect. Our quality desk will review and approve the request within 24 hours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">4. Replacement Process</h2>
          <p>
            Upon approval, an expedited re-print order will be queued immediately at no extra cost, and our courier partner will coordinate doorstep pick-up of the affected item simultaneously.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">5. Refund Processing Timeline</h2>
          <p>
            If you opt for a refund rather than replacement, refunds are credited back to your original source of payment (UPI / Bank Account / Card) via Cashfree within <strong>3 to 5 business days</strong> of approval.
          </p>
        </section>
      </div>
    </div>
  );
}

