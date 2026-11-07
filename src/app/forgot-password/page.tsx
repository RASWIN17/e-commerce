'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Reset Password</h1>
        <p className="text-xs text-[#77736C]">
          Enter your registered email address to receive secure instructions.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-sm flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="bg-white border border-[#E8E5DF] p-6 rounded-sm shadow-subtle space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#F7F6F2] border border-[#D5D1C8] pl-9 pr-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
            />
            <Mail className="w-4 h-4 text-[#77736C] absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#171717] text-white py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#2A2A2A] rounded-sm transition-colors"
        >
          <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-[#77736C] hover:text-[#171717] underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

