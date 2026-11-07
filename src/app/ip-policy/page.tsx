import React from 'react';

export default function IPPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Intellectual Property and Copyright Policy
        </h1>
        <p className="text-xs text-[#77736C] mt-1">Compliance with the Copyright Act, 1957 and Trade Marks Act, 1999</p>
      </div>

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">1. Ownership of Brand & Original Designs</h2>
          <p>
            All content published on this website—including but not limited to the brand mark &quot;IMAGIX&quot;, custom typography, vector graphics, apparel mockups, editorial photography, color arrangements, and user interface designs—is the exclusive intellectual property of <strong>IMAGIX Apparel Private Limited</strong> or licensed contributors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">2. Print-Ready Artwork Protection</h2>
          <p>
            High-resolution digital artwork files utilized for DTG production and sent via private API to our fulfilment partner Qikink are trade secrets and proprietary artistic works. Unauthorized scraping, reproduction, extraction, or commercial re-sale is strictly prohibited and subject to civil injunctions and statutory damages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#171717]">3. Notice and Takedown Procedure</h2>
          <p>
            If you are a copyright owner or an authorized agent and believe that any design listed on our website infringes upon your copyright, please send an official infringement notification to <strong>legal@imagix.in</strong> with the following details:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Direct URL link to the allegedly infringing product on IMAGIX.</li>
            <li>Proof of original authorship or trademark registration certificate.</li>
            <li>Your contact address, telephone number, and email.</li>
          </ul>
          <p>
            Our legal compliance cell investigates and acts on bona fide notices within 36 hours.
          </p>
        </section>
      </div>
    </div>
  );
}

