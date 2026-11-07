'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, MessageSquare, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminFeedbackPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const [revRes, fbRes] = await Promise.all([
        supabase.from('product_reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_feedback').select('*').order('created_at', { ascending: false }),
      ]);

      if (revRes.data) setReviews(revRes.data);
      if (fbRes.data) setFeedback(fbRes.data);
    } catch (err) {
      console.error('Failed to load admin feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleReviewStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    const supabase = createClient();
    await supabase.from('product_reviews').update({ status: newStatus }).eq('id', id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#77736C] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p>Loading customer reviews and feedback streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Product Reviews & Customer Inquiries
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Review authentic verified customer ratings and direct customer care inquiries.
        </p>
      </div>

      {/* Customer Feedback Submissions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#171717]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Direct Customer Messages ({feedback.length})
          </h2>
        </div>

        {feedback.length === 0 ? (
          <div className="bg-white border border-[#E8E5DF] p-8 text-center text-xs text-[#77736C] rounded-sm">
            No direct customer feedback submissions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((fb) => (
              <div
                key={fb.id}
                className="bg-white border border-[#E8E5DF] p-5 rounded-sm shadow-subtle space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171717]">{fb.name} ({fb.email})</span>
                  <span className="text-[10px] uppercase font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm">
                    {fb.type}
                  </span>
                </div>
                <h3 className="font-medium text-[#171717]">{fb.subject}</h3>
                <p className="text-[#77736C] leading-relaxed">{fb.message}</p>
                <span className="text-[11px] text-[#77736C] block">
                  Received on {new Date(fb.created_at).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Reviews Moderation */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#171717]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
            Product Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white border border-[#E8E5DF] p-8 text-center text-xs text-[#77736C] rounded-sm">
            No product reviews submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#171717]">{rev.user_name}</span>
                    {rev.is_verified_purchase && (
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        Verified Purchase
                      </span>
                    )}
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#171717]">{rev.title}</h3>
                  <p className="text-xs text-[#77736C]">&quot;{rev.review_text}&quot;</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase ${
                      rev.status === 'approved' ? 'text-emerald-800 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                    }`}
                  >
                    {rev.status}
                  </span>
                  <button
                    onClick={() => toggleReviewStatus(rev.id, rev.status)}
                    className="border border-[#D5D1C8] px-3 py-1.5 text-xs text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
                  >
                    Toggle Visibility
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
