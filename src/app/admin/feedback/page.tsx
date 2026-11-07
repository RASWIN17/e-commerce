'use client';

import React, { useState } from 'react';
import { SAMPLE_REVIEWS } from '@/lib/data/sampleProducts';
import { Star } from 'lucide-react';

interface ReviewItem {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string;
  review_text: string;
  is_verified_purchase: boolean;
  status: 'approved' | 'rejected' | 'pending';
  helpful_votes: number;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(
    SAMPLE_REVIEWS.map((r) => ({ ...r, status: r.status as 'approved' | 'rejected' | 'pending' }))
  );

  const toggleStatus = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'approved' ? 'rejected' : 'approved' }
          : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Product Reviews & Community Moderation
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Review authentic verified customer ratings and moderate feedback under ASCI guidelines.
        </p>
      </div>

      <div className="space-y-4">
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
                onClick={() => toggleStatus(rev.id)}
                className="border border-[#D5D1C8] px-3 py-1.5 text-xs text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
              >
                Toggle Visibility
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
