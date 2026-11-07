'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-[#77736C]">
          Sign in to access your orders, saved addresses, and wishlist.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-sm flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        {/* Google One-Click Login */}
        <div className="space-y-4">
          <GoogleSignInButton label="Continue with Google" />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E8E5DF] w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#77736C] absolute">
              or with email
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#171717]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#77736C] hover:text-[#171717] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#171717] text-white py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors rounded-sm shadow-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-[#77736C]">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-[#171717] underline">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
