'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !email.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const supabase = createClient();
      const ref = `IMX-INQ-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase.from('customer_feedback').insert({
        name,
        email,
        subject: orderNumber ? `Inquiry regarding order #${orderNumber}` : 'General Customer Care Inquiry',
        message: orderNumber ? `[Order Ref: ${orderNumber}] ${message}` : message,
        type: 'inquiry',
        status: 'new',
      });

      if (error) {
        throw error;
      }

      setTicketRef(ref);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit your message. Please try again or email care@imagix.in directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-[#77736C] mt-1">
          Have an inquiry regarding an order, sizing, or partnerships? Reach our team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Statutory Business Details Card */}
        <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6 text-xs text-[#77736C]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Corporate & Seller Disclosures
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#171717] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#171717] block">Registered Corporate Office:</strong>
                IMAGIX Apparel Private Limited<br />
                Studio 4B, Minimalist Mill Compound, Tirupur, Tamil Nadu – 641602, India
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#171717] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#171717] block">Consumer Care Email:</strong>
                care@imagix.in
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#171717] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#171717] block">Customer Care Helpline:</strong>
                +91 80 4718 9000 (Mon–Sat, 10:00 AM – 6:00 PM IST)
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#171717] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#171717] block">Grievance Redressal:</strong>
                Karthik Subramanian, Grievance Officer<br />
                Direct Email: grievance@imagix.in<br />
                <Link href="/grievance" className="underline text-[#171717] mt-1 inline-block">
                  Submit a formal grievance ticket →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Send Us a Message
          </h2>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-sm flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Thank you! Your message has been logged in our system. Reference #{ticketRef}. Our support team typically replies within 24 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#171717] font-semibold mb-1">Your Name</label>
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
                <label className="block text-[#171717] font-semibold mb-1">Email Address</label>
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
                <label className="block text-[#171717] font-semibold mb-1">Order Number (If applicable)</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. IMX-839201"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[#171717] font-semibold mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today?"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#171717] text-white py-3 text-xs uppercase tracking-widest font-semibold hover:bg-[#2A2A2A] rounded-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
