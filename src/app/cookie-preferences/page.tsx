'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export default function CookiePreferencesPage() {
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('imagix_cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalytics(parsed.analytics || false);
        setMarketing(parsed.marketing || false);
      }
    } catch (e) {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        'imagix_cookie_consent',
        JSON.stringify({
          essential: true,
          analytics,
          marketing,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-xs text-[#77736C] leading-relaxed">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
          Cookie & Privacy Preferences
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Control how cookies and personal identifiers are utilized on IMAGIX under DPDP Act 2023.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#E8E5DF] pb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#171717]">Strictly Necessary Cookies</h2>
              <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                Always Active
              </span>
            </div>
            <p className="text-xs text-[#77736C] mt-1">
              Required for basic website functionality, authentication sessions, and maintaining your shopping bag across pages.
            </p>
          </div>
          <input
            type="checkbox"
            checked={essential}
            disabled
            className="w-4 h-4 text-[#171717] rounded cursor-not-allowed opacity-60"
          />
        </div>

        <div className="border-b border-[#E8E5DF] pb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#171717]">Analytics & Performance Cookies</h2>
            <p className="text-xs text-[#77736C] mt-1">
              Allows us to measure traffic, popular drops, and site speed to continuously improve page responsiveness.
            </p>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="w-4 h-4 text-[#171717] rounded cursor-pointer"
          />
        </div>

        <div className="border-b border-[#E8E5DF] pb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#171717]">Marketing & Drop Notifications</h2>
            <p className="text-xs text-[#77736C] mt-1">
              Used only if you opt-in to receive new product launch announcements and exclusive subscriber codes.
            </p>
          </div>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="w-4 h-4 text-[#171717] rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Preferences saved successfully!</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#77736C]">
              You can modify or withdraw your consent at any time.
            </span>
          )}

          <button
            type="submit"
            className="bg-[#171717] text-white px-6 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2A2A] rounded-sm transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

