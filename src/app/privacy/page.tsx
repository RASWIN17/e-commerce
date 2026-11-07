import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Privacy Policy</h1>
        <p className="text-xs text-[#77736C] mt-1">
          Compliant with Digital Personal Data Protection Act (DPDP), 2023 | Effective: November 2026
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Commitment to Personal Data Protection</h2>
          <p>
            IMAGIX Apparel Private Limited (&quot;Data Fiduciary&quot;) respects the privacy and fundamental data rights of every individual (&quot;Data Principal&quot;). This policy outlines how we collect, process, store, and safeguard your personal data when you interact with our website and services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Personal Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Identity & Contact Data:</strong> Full name, shipping address, mobile telephone number, and email address.</li>
            <li><strong>Transaction & Invoicing Data:</strong> Order reference number, variant selections, payment status (via Cashfree tokens), and GST tax snapshots.</li>
            <li><strong>Technical Data:</strong> IP address, device metadata, and essential session cookies for cart persistence.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Specified Purpose of Processing</h2>
          <p>
            Your personal data is collected solely for the following specified lawful purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Transmitting order and shipping instructions to our production and logistics partner (Qikink & Delhivery/Bluedart) to fulfill delivery.</li>
            <li>Generating statutory GST tax invoices under the Central Goods and Services Tax Act.</li>
            <li>Sending transactional notifications (order confirmation, dispatch updates, tracking links).</li>
            <li>Resolving customer grievances and providing after-sales support.</li>
          </ul>
          <p className="font-semibold text-[#171717]">
            We never sell, rent, or trade your personal information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">4. Rights of the Data Principal under DPDP Act 2023</h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023, you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Right to Access:</strong> Request a summary of personal data being processed.</li>
            <li><strong>Right to Correction & Erasure:</strong> Request the correction, updating, or deletion of personal data no longer necessary for legal retention.</li>
            <li><strong>Right of Grievance Redressal:</strong> Submit a grievance directly to our designated Grievance Officer.</li>
            <li><strong>Right to Nominate:</strong> Nominate an individual to exercise rights in the event of death or incapacity.</li>
          </ul>
          <p>
            To exercise any of these rights, please email our Data Grievance Officer at <strong>grievance@imagix.in</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">5. Data Retention & Security Architecture</h2>
          <p>
            Data is hosted securely within Supabase PostgreSQL with encrypted connection pooling, strict Row Level Security (RLS), and zero public access to private tables. Transaction records are retained for the statutory period required by Indian tax laws.
          </p>
        </section>
      </div>
    </div>
  );
}

