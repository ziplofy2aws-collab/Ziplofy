'use client';
import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Gift, Megaphone, BadgeCheck, Bot,
  Eye, EyeOff, Info, MailCheck, Loader2,
} from 'lucide-react';
import useBranding from '@/lib/useBranding';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const FEATURES = [
  {
    title: 'FREE WhatsApp Business API',
    desc: 'Instant verification & setup with Meta Cloud API.',
    icon: MessageSquare,
  },
  {
    title: 'AI Chatbot & Bot Flows',
    desc: 'Train AI on your data and build drag-and-drop flows.',
    icon: Bot,
  },
  {
    title: 'Broadcasts & CRM Pipeline',
    desc: 'Run campaigns and close deals from one inbox.',
    icon: Megaphone,
  },
];

const TRUSTED = ['StyleKart', 'CityCare', 'GrowthLab', 'NovaRetail'];

function authErrorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!err.response) {
      if (err.code === 'ECONNABORTED') return 'Server took too long to respond. Please try again.';
      return 'Cannot reach the server. Check your connection and try again.';
    }
    if (err.response.status >= 500) return 'Server error. Please try again in a moment.';
  }
  return fallback;
}

function Field({
  label, type = 'text', value, onChange, right, required, autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
  required?: boolean;
  autoComplete?: string;
}) {
  const filled = value.length > 0;
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer w-full h-[52px] rounded-xl border border-[#e3e3e3] bg-white px-3.5 pt-4 pb-1 text-[15px] text-[#101828] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
      <label className={`pointer-events-none absolute left-3.5 text-[#667085] transition-all ${
        filled
          ? 'top-1.5 text-[11px]'
          : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px]'
      }`}>
        {label}
      </label>
      {right ? <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">{right}</div> : null}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuthStore();
  const brand = useBranding();
  const submittingRef = useRef(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const brandName = brand.name || 'Codiic Panel';
  const canSubmit = useMemo(
    () => !!(name.trim() && email.trim() && phone.trim() && password && confirmPassword && password === confirmPassword && password.length >= 6) && !loading,
    [name, email, phone, password, confirmPassword, loading],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const fullPhone = phone.replace(/\D/g, '').startsWith('91')
        ? `+${phone.replace(/\D/g, '')}`
        : `+91${phone.replace(/\D/g, '')}`;
      const needsVerification = await register(name.trim(), email.trim().toLowerCase(), password, fullPhone);
      if (needsVerification) {
        setVerificationSent(true);
        return;
      }
      toast.success('Account created!');
      router.push('/client/dashboard');
    } catch (err: unknown) {
      toast.error(authErrorMessage(err, 'Registration failed'));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const result = await loginWithGoogle(credential);
      if (result && result.requires2FA) {
        toast.success('Enter your two-factor code on the login page');
        router.push('/auth/login');
        return;
      }
      toast.success('Account ready!');
      router.push('/client/dashboard');
    } catch (err: unknown) {
      toast.error(authErrorMessage(err, 'Google sign-up failed'));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f1f1] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#e3e3e3] shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-[#059669]" />
          </div>
          <h1 className="text-xl font-bold text-[#101828] mb-2">Verify your email</h1>
          <p className="text-sm text-[#667085] mb-6">
            We sent a verification link to <strong className="text-[#101828]">{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center h-12 rounded-xl text-white font-semibold hover:brightness-105 transition shadow-[0_8px_20px_rgba(5,150,105,0.22)]"
            style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }}
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left promo panel ── */}
      <aside className="relative hidden lg:flex flex-col bg-[#ecfdf5] px-10 xl:px-14 py-8 overflow-hidden">
        <div className="absolute -right-20 top-24 w-72 h-72 rounded-full bg-[#059669]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-20 w-64 h-64 rounded-full bg-[#99f6e4]/20 blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5 mb-10">
          {brand.logo ? (
            <img src={brand.logo} alt={brandName} className="h-9 w-auto object-contain" />
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-[#059669] flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#101828] tracking-tight">{brandName}</span>
            </>
          )}
        </Link>

        <div className="relative flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-[34px] xl:text-[40px] leading-[1.15] font-extrabold text-[#101828] mb-6">
            Experience the future of{' '}
            <span className="text-[#059669]">WhatsApp Marketing</span>
          </h1>

          <div
            className="mb-8 flex items-center gap-3 rounded-xl text-white px-4 py-3.5 shadow-[0_8px_20px_rgba(5,150,105,0.22)]"
            style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }}
          >
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold leading-snug">
              Free forever plan. Launch WhatsApp campaigns &amp; grow leads 5X.
            </p>
          </div>

          <p className="text-[11px] font-bold tracking-[0.14em] text-[#667085] mb-3">
            YOUR FREE FOREVER PLAN INCLUDES
          </p>
          <div className="space-y-3 mb-10">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3 bg-white rounded-xl border border-[#e3e3e3] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] px-4 py-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#101828]">{f.title}</p>
                    <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#344054] mb-3">Trusted by 500+ businesses</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {TRUSTED.map((name) => (
                <span key={name} className="text-sm font-bold text-[#98A2B3] tracking-wide uppercase">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="bg-white flex flex-col min-h-screen px-5 sm:px-10 lg:px-12 xl:px-16 py-6 lg:py-8">
        <div className="flex items-center justify-between lg:justify-end mb-6">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            {brand.logo ? (
              <img src={brand.logo} alt={brandName} className="h-8 w-auto" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#101828]">{brandName}</span>
              </>
            )}
          </Link>
          <p className="text-sm text-[#475467]">
            Already a member?{' '}
            <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px]">
            <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#101828] leading-tight mb-2">
              Create Your {brandName} Account
            </h2>
            <p className="text-[15px] text-[#667085] mb-7">
              Fill in the details below to get started with your FREE FOREVER plan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field label="Full Name" value={name} onChange={setName} required autoComplete="name" right={<Info className="w-4 h-4" />} />
              <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" right={<Info className="w-4 h-4" />} />

              <div className="relative flex h-[52px] rounded-xl border border-[#e3e3e3] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden bg-white">
                <div className="flex items-center gap-1.5 px-3 border-r border-[#e3e3e3] bg-[#f6f6f7] text-sm font-medium text-[#344054] shrink-0">
                  <span className="text-base leading-none" aria-hidden>🇮🇳</span>
                  +91
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    required
                    placeholder=" "
                    className="peer w-full h-full px-3 pt-4 pb-1 text-[15px] text-[#101828] outline-none bg-transparent"
                    autoComplete="tel"
                  />
                  <label className={`pointer-events-none absolute left-3 text-[#667085] transition-all ${
                    phone
                      ? 'top-1.5 text-[11px]'
                      : 'top-1/2 -translate-y-1/2 text-[15px] peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px]'
                  }`}>
                    Personal WhatsApp Number
                  </label>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                  <Info className="w-4 h-4" />
                </div>
              </div>

              <Field
                label="Enter Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                required
                autoComplete="new-password"
                right={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-[#475467]" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <Field
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                autoComplete="new-password"
                right={
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="hover:text-[#475467]" aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`mt-2 w-full h-12 rounded-xl font-semibold text-[15px] transition flex items-center justify-center gap-2 ${
                  canSubmit && !loading
                    ? 'text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] hover:brightness-105'
                    : 'bg-[#D0D5DD] text-white cursor-not-allowed'
                }`}
                style={canSubmit && !loading ? { background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' } : undefined}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Start Your FREE FOREVER Plan
              </button>
            </form>

            <GoogleSignInButton
              text="signup_with"
              disabled={loading}
              onCredential={handleGoogle}
              onError={(msg) => toast.error(msg)}
            />

            <p className="mt-5 text-center text-xs text-[#667085]">
              By continuing you agree to our{' '}
              <Link href="/privacy" className="text-emerald-700 hover:underline font-medium">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/terms" className="text-emerald-700 hover:underline font-medium">Terms of Service</Link>.
            </p>
          </div>
        </div>

        {/* Decorative badge like verified check in reference */}
        <div className="hidden lg:flex justify-end pt-2">
          <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-[#059669]" />
          </div>
        </div>
      </section>
    </div>
  );
}
