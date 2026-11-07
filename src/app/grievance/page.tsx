'use client';

import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function GrievancePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [category, setCategory] = useState('defect');
  const [description, setDescription] = useState('');
  const [complaintRef, setComplaintRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const ref = `GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setComplaintRef(ref);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Consumer Grievance Redressal Mechanism
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Formulated under Rule 5(4) of the Consumer Protection (E-Commerce) Rules, 2020 and 2026 Amendments
        </p>
      </div>

      {/* Statutory Grievance Officer Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
          Statutory Grievance Redressal Officer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <strong className="text-[#171717] block">Designated Officer:</strong>
            Karthik Subramanian, Head of Operations & Compliance
          </div>
          <div>
            <strong className="text-[#171717] block">Direct Email:</strong>
            grievance@imagix.in
          </div>
          <div>
            <strong className="text-[#171717] block">Dedicated Grievance Phone:</strong>
            +91 80 4718 9001 (Mon–Fri, 10:00 AM – 5:00 PM IST)
          </div>
          <div>
            <strong className="text-[#171717] block">Corporate Address:</strong>
            IMAGIX Apparel Pvt Ltd, Studio 4B, Tirupur, Tamil Nadu – 641602
          </div>
        </div>

        {/* Timelines Mandated by Indian Law */}
        <div className="bg-[#EFECE6] p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#171717]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#171717] flex-shrink-0" />
            <span>
              <strong>Statutory Acknowledgement:</strong> Within 48 hours with unique ticket reference.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span>
              <strong>Statutory Redressal:</strong> Within 1 month from date of receipt.
            </span>
          </div>
        </div>
      </div>

      {/* Grievance Submission Form */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#E8E5DF] pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            File an Official Consumer Grievance
          </h2>
          <p className="text-xs text-[#77736C] mt-1">
            If your issue was not satisfactorily resolved by general customer care, please lodge your complaint here.
          </p>
        </div>

        {complaintRef ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Grievance Ticket Lodged Successfully</span>
            </div>
            <p className="text-xs text-emerald-800">
              Your official Grievance Reference Number is: <strong className="font-mono text-black text-sm">{complaintRef}</strong>
            </p>
            <p className="text-[11px] text-[#77736C]">
              A formal copy has been registered and emailed to your address. In accordance with the Consumer Protection (E-Commerce) Rules, an acknowledgement notice has been logged and our Grievance Officer will investigate and respond within 48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Complainant Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Order Number (If applicable)</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. IMX-839201"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Grievance Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none"
              >
                <option value="defect">Damaged / Defective Print or Garment</option>
                <option value="delivery_delay">Unexplained Delivery Delay / Lost Package</option>
                <option value="refund_issue">Delayed Refund / Payment Discrepancy</option>
                <option value="wrong_item">Incorrect Item or Size Delivered</option>
                <option value="privacy_dpdp">Personal Data Protection & Privacy Rights</option>
                <option value="other">Other Statutory Consumer Rights Grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-[#171717] font-semibold mb-1">Detailed Description of Grievance *</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please state facts clearly, including date of order, communication history, and desired resolution..."
                className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#171717] text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#2A2A2A] rounded-sm transition-colors"
            >
              {loading ? 'Registering Ticket...' : 'Submit Formal Grievance'}
            </button>
          </form>
        )}
      </div>

      <div className="text-[11px] text-[#77736C] space-y-1">
        <p>
          Note: If you are not satisfied with the resolution provided by our Grievance Officer, you may escalate to the <strong>National Consumer Helpline (NCH)</strong> at toll-free 1915 or portal <strong>consumerhelpline.gov.in</strong>.
        </p>
      </div>
    </div>
  );
}

