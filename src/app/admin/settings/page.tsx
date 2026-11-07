'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  const [businessName, setBusinessName] = useState('IMAGIX Apparel Private Limited');
  const [brandName, setBrandName] = useState('IMAGIX');
  const [gstin, setGstin] = useState('33AABCU9603R1ZM');
  const [address, setAddress] = useState('Studio 4B, Minimalist Mill Compound, Tirupur, Tamil Nadu - 641602, India');
  const [supportEmail, setSupportEmail] = useState('care@imagix.in');
  const [supportPhone, setSupportPhone] = useState('+91 80 4718 9000');
  const [officerName, setOfficerName] = useState('Karthik Subramanian');
  const [officerEmail, setOfficerEmail] = useState('grievance@imagix.in');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Business & Statutory Compliance Settings
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Configure statutory declarations mandated under Consumer Protection, Legal Metrology, and Indian GST rules.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Business settings updated successfully across storefront and legal pages!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717] pb-2 border-b border-[#E8E5DF]">
            1. Corporate Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#171717] font-semibold mb-1">Legal Registered Entity *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">GSTIN (India) *</label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Country of Origin</label>
              <input
                type="text"
                disabled
                value="India"
                className="w-full p-2.5 bg-[#EFECE6] border border-[#D5D1C8] rounded-sm text-[#77736C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#171717] font-semibold mb-1">Registered Corporate Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E8E5DF]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717] pb-2 border-b border-[#E8E5DF]">
            2. Customer Care & Statutory Grievance Redressal
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#171717] font-semibold mb-1">Customer Care Email *</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Toll-Free Support Helpline *</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Grievance Officer Name *</label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Grievance Officer Direct Email *</label>
              <input
                type="email"
                required
                value={officerEmail}
                onChange={(e) => setOfficerEmail(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Disclosures</span>
          </button>
        </div>
      </form>
    </div>
  );
}

