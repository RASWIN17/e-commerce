'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadApprovedReviews() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApprovedReviews();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!feedbackText.trim() || !feedbackEmail.trim()) return;

    try {
      setSubmitting(true);
      const supabase = createClient();
      const { error } = await supabase.from('customer_feedback').insert({
        name: feedbackName,
        email: feedbackEmail,
        subject: feedbackSubject || `${feedbackType.toUpperCase()} from storefront`,
        message: feedbackText,
        type: feedbackType,
        status: 'new',
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Customer Reviews & Verified Feedback
        </h1>
        <p className="text-xs sm:text-sm text-[#77736C] mt-1">
          Authentic feedback from verified purchases and direct customer experiences.
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          {reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-[#171717]">{avgRating}</span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-sm font-bold text-[#171717]">Authentic Reviews Policy</span>
              <p className="text-xs text-[#77736C]">
                We strictly publish genuine reviews from customers with confirmed deliveries.
              </p>
            </div>
          )}
          <p className="text-xs text-[#77736C]">
            {reviews.length > 0
              ? `Based on ${reviews.length} verified purchase ${reviews.length === 1 ? 'review' : 'reviews'}`
              : 'Zero fabricated reviews or artificial testimonials.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-emerald-800 bg-emerald-50 px-4 py-3 rounded-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>
            Only customers with verified delivered orders can submit product ratings under our CPA transparency standards.
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-[#171717]">Verified Buyer Reviews</h2>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#E8E5DF] p-10 rounded-sm text-center space-y-2">
            <p className="text-sm font-semibold text-[#171717]">No Published Reviews Yet</p>
            <p className="text-xs text-[#77736C] max-w-md mx-auto">
              Our products are crafted on-demand. If you recently received your order, sign in to your account to submit a verified product review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
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
              </div>
            ))}
          </div>
        )}
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
          Have an idea for a drop or want to share feedback with our product design team? All submissions are routed directly to our operations team.
        </p>

        {formError && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-sm flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Thank you for your feedback! Our team reviews every submission.</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none"
              >
                <option value="suggestion">Product / Design Suggestion</option>
                <option value="fit">Sizing & Fit Feedback</option>
                <option value="complaint">Service Issue</option>
                <option value="inquiry">General Inquiry</option>
              </select>

              <input
                type="text"
                placeholder="Subject (Optional)"
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                className="p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

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
              disabled={submitting}
              className="bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
