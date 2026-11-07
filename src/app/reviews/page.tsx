'use client';

import React, { useState } from 'react';
import { SAMPLE_REVIEWS } from '../../lib/data/sampleProducts';
import { Star, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-xs sm:text-sm text-[#77736C] mt-1">
          Authentic feedback from verified customers across India.
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-[#171717]">4.9</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs text-[#77736C]">Based on 140+ verified delivered orders</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-emerald-800 bg-emerald-50 px-4 py-3 rounded-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>
            Only customers with completed delivered purchases are eligible to post verified reviews.
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-[#171717]">Recent Reviews</h2>
        <div className="space-y-4">
          {SAMPLE_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#171717]">{rev.user_name}</span>
                  {rev.is_verified_purchase && (
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <div className="flex text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[#171717]">{rev.title}</h3>
              <p className="text-xs text-[#77736C] leading-relaxed">&quot;{rev.review_text}&quot;</p>
              <span className="text-[11px] text-[#77736C] block">
                Helpful to {rev.helpful_votes} people
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Customer Feedback & Suggestion Box */}
      <div className="bg-[#EFECE6] p-6 sm:p-8 rounded-sm space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#171717]" />
          <h2 className="text-base font-bold text-[#171717]">
            Feedback, Suggestions & Inquiries
          </h2>
        </div>
        <p className="text-xs text-[#77736C]">
          Have an idea for a drop or want to share feedback with our product design team?
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Thank you for your valuable feedback! Our team reviews every suggestion.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none"
            >
              <option value="suggestion">Product / Design Suggestion</option>
              <option value="fit">Sizing & Fit Feedback</option>
              <option value="complaint">Service Issue</option>
              <option value="inquiry">General Inquiry</option>
            </select>

            <textarea
              required
              rows={4}
              placeholder="Tell us what you think..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
            />

            <button
              type="submit"
              className="bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm transition-colors"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

