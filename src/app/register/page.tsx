'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentTerms, setConsentTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    if (!consentTerms) {
      setErrorMsg('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      setSuccessMsg('Account created successfully! Please check your email inbox to verify your account.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-[#77736C]">
          Join IMAGIX for fast checkout, seamless order tracking, and exclusive drops.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-sm flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        {/* Google One-Click Register */}
        <div className="space-y-4">
          <GoogleSignInButton label="Sign up with Google" />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E5DF] w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#77736C] absolute">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] pl-9 pr-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
              <User className="w-4 h-4 text-[#77736C] absolute left-3 top-3" />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Password (Min 8 Characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] pl-9 pr-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
              <Lock className="w-4 h-4 text-[#77736C] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F6F2] border border-[#D5D1C8] pl-9 pr-3.5 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
              <Lock className="w-4 h-4 text-[#77736C] absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              className="mt-0.5 rounded border-[#D5D1C8]"
            />
            <label htmlFor="terms" className="text-[11px] text-[#77736C] leading-tight">
              I agree to IMAGIX&apos;s <Link href="/terms" className="underline text-[#171717]">Terms of Service</Link> and acknowledge the <Link href="/privacy" className="underline text-[#171717]">Privacy Policy</Link> under DPDP Act 2023.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#171717] text-white py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors rounded-sm shadow-sm mt-3"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-[#77736C]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#171717] underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
