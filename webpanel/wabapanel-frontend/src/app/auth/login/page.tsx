'use client';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageSquare, Eye, EyeOff, Lock, Loader2,
  CheckCircle2, Megaphone,
} from 'lucide-react';
import useBranding from '@/lib/useBranding';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const TRUSTED = ['Adani', 'Tata', 'Godrej', 'Asian Paints', 'CEAT', 'Sobha', 'Physics Wallah', 'Vivo'];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loadUser } = useAuthStore();
  const brand = useBranding();
  const brandName = brand.name || 'Codiic Panel';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [twoFA, setTwoFA] = useState<{ method: string; challengeToken: string } | null>(null);
  const [code, setCode] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [blockRemaining, setBlockRemaining] = useState(0);

  const canSubmit = useMemo(
    () => !!(email.trim() && password.length >= 1) && !blocked,
    [email, password, blocked],
  );

  const redirectAfterLogin = () => {
    const u = useAuthStore.getState().user;
    let saved = '';
    try { saved = sessionStorage.getItem('postLoginRedirect') || ''; sessionStorage.removeItem('postLoginRedirect'); } catch { /* */ }
    const isAdmin = u?.role === 'admin' || u?.role === 'super_admin';
    if (saved && (isAdmin || !saved.startsWith('/admin'))) router.push(saved);
    else router.push(isAdmin ? '/admin/dashboard' : '/client/dashboard');
  };

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const currentToken = localStorage.getItem('token');
      if (currentToken && currentToken !== token) {
        localStorage.setItem('adminToken', currentToken);
      }
      localStorage.setItem('token', token);
      loadUser().then(() => {
        toast.success('Logged in successfully');
        const u = useAuthStore.getState().user;
        let saved = '';
        try { saved = sessionStorage.getItem('postLoginRedirect') || ''; sessionStorage.removeItem('postLoginRedirect'); } catch { /* */ }
        const isAdmin = u?.role === 'admin' || u?.role === 'super_admin';
        if (saved && (isAdmin || !saved.startsWith('/admin'))) router.push(saved);
        else router.push(isAdmin ? '/admin/dashboard' : '/client/dashboard');
      }).catch(() => {
        toast.error('Token expired or invalid');
        localStorage.removeItem('token');
      });
    }
  }, [searchParams, loadUser, router]);

  useEffect(() => {
    if (!blocked || blockRemaining <= 0) return;
    const t = setInterval(() => {
      setBlockRemaining((s) => {
        if (s <= 1) { setBlocked(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [blocked, blockRemaining]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result && result.requires2FA) {
        setTwoFA({ method: result.method || 'app', challengeToken: result.challengeToken || '' });
        toast.success(result.method === 'email' ? 'Code sent to your email' : 'Enter your authenticator code');
        return;
      }
      toast.success('Login successful!');
      redirectAfterLogin();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string; code?: string } } };
      if (error.response?.status === 429 || error.response?.data?.code === 'LOGIN_BLOCKED') {
        setBlocked(true);
        setBlockRemaining(5 * 60);
        toast.error(error.response?.data?.message || 'Too many attempts. Login temporarily blocked.');
      } else {
        if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') setNeedsVerification(true);
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFA) return;
    setLoading(true);
    try {
      await useAuthStore.getState().complete2FALogin(twoFA.challengeToken, code.trim());
      toast.success('Login successful!');
      redirectAfterLogin();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAResend = async () => {
    if (!twoFA) return;
    try {
      await authApi.twoFactorLoginResend(twoFA.challengeToken);
      toast.success('New code sent to your email');
    } catch {
      toast.error('Could not resend code');
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email sent. Please check your inbox.');
    } catch {
      toast.error('Could not send verification email');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left marketing panel ── */}
      <aside className="relative hidden lg:flex flex-col bg-[#ecfdf5] px-10 xl:px-14 py-8 overflow-hidden">
        <div className="absolute -right-16 top-32 w-80 h-80 rounded-full bg-[#059669]/10 blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-40 w-56 h-56 rounded-full bg-[#99f6e4]/25 blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5 mb-8">
          {brand.logo ? (
            <img src={brand.logo} alt={brandName} className="h-9 w-auto object-contain" />
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-[#059669] flex items-center justify-center shadow-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#047857] tracking-tight">{brandName}</span>
            </>
          )}
        </Link>

        <div className="relative flex-1 flex flex-col">
          <h1 className="text-[34px] xl:text-[40px] leading-[1.15] font-extrabold text-[#111827] max-w-md mb-8">
            Send personalized campaigns on WhatsApp
          </h1>

          {/* Hero composition */}
          <div className="relative flex-1 min-h-[320px] max-h-[420px] mb-8">
            <div className="absolute inset-x-4 bottom-0 top-6 rounded-[28px] bg-gradient-to-b from-[#d1fae5] to-[#a7f3d0]/60" />

            {/* Floating ad card */}
            <div className="absolute left-0 top-8 w-[150px] rounded-xl bg-white shadow-[0_8px_24px_rgba(16,24,40,0.12)] p-2.5 z-10">
              <div className="h-16 rounded-xl mb-2 flex items-center justify-center" style={{ background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' }}>
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <p className="text-[10px] font-bold text-[#101828] leading-tight">Summer Sale is live</p>
              <p className="text-[9px] text-[#667085] mt-0.5">Click to WhatsApp Ad</p>
            </div>

            {/* Center portrait placeholder */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-[210px] h-[300px] rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(16,24,40,0.18)] z-[5] bg-[#111827]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
                alt=""
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#047857]/40 to-transparent" />
            </div>

            {/* Chat bubble */}
            <div className="absolute right-2 top-16 z-10 max-w-[150px]">
              <div className="bg-[#059669] text-white text-[11px] font-semibold px-3 py-2 rounded-2xl rounded-tr-sm shadow-lg">
                I want to buy
              </div>
            </div>

            {/* Stat badges */}
            <div className="absolute right-6 top-[42%] z-10 bg-white rounded-xl shadow-lg px-3 py-2">
              <p className="text-lg font-extrabold text-[#059669] leading-none">3.2x</p>
              <p className="text-[9px] text-[#667085] font-medium">ROI lift</p>
            </div>
            <div className="absolute left-4 bottom-24 z-10 bg-white rounded-xl shadow-lg px-3 py-2">
              <p className="text-lg font-extrabold text-teal-600 leading-none">150x</p>
              <p className="text-[9px] text-[#667085] font-medium">Faster replies</p>
            </div>

            {/* Order placed */}
            <div className="absolute right-4 bottom-16 z-10 flex items-center gap-2 bg-white rounded-full shadow-lg pl-1.5 pr-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              </div>
              <span className="text-[11px] font-bold text-[#101828]">Order Placed</span>
            </div>
          </div>

          <div className="relative border-t border-[#e3e3e3] pt-5">
            <p className="text-sm text-[#475467] mb-3">Trusted by 500+ businesses</p>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
              {TRUSTED.map((name) => (
                <span key={name} className="text-[11px] font-bold text-[#98A2B3] tracking-wide uppercase truncate">
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
            Not a member yet?{' '}
            <Link href="/auth/register" className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800">
              Sign up
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[420px]">
            {twoFA ? (
              <>
                <p className="text-[11px] font-bold tracking-[0.16em] text-[#98A2B3] mb-2">SECURE LOGIN</p>
                <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#101828] leading-tight mb-2">
                  Two-step verification
                </h2>
                <p className="text-[15px] text-[#667085] mb-7">
                  {twoFA.method === 'email'
                    ? 'Enter the 6-digit code sent to your email.'
                    : 'Enter the 6-digit code from your authenticator app.'}
                </p>
                <form onSubmit={handle2FASubmit} className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center mx-auto mb-1">
                    <Lock className="w-5 h-5 text-[#059669]" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-12 rounded-xl border border-[#e3e3e3] px-3.5 text-[15px] text-center tracking-[0.35em] font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={loading || code.trim().length < 4}
                    className={`w-full h-12 rounded-xl font-semibold text-[15px] transition flex items-center justify-center gap-2 ${
                      code.trim().length >= 4 && !loading
                        ? 'text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] hover:brightness-105'
                        : 'bg-[#D0D5DD] text-white cursor-not-allowed'
                    }`}
                    style={code.trim().length >= 4 && !loading ? { background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' } : undefined}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Verify & Continue
                  </button>
                  <div className="flex items-center justify-between text-sm pt-1">
                    <button type="button" onClick={() => { setTwoFA(null); setCode(''); }} className="text-[#667085] hover:text-[#101828]">
                      Back to login
                    </button>
                    {twoFA.method === 'email' && (
                      <button type="button" onClick={handle2FAResend} className="font-semibold text-[#047857] hover:underline">
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold tracking-[0.16em] text-[#98A2B3] mb-2">WELCOME BACK</p>
                <h2 className="text-[28px] sm:text-[32px] font-extrabold text-[#101828] leading-tight mb-7">
                  Log in to {brandName}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <input
                    type="email"
                    placeholder="Username / Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full h-12 rounded-xl border border-[#e3e3e3] px-3.5 text-[15px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full h-12 rounded-xl border border-[#e3e3e3] px-3.5 pr-11 text-[15px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#475467]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {blocked && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                      <p className="font-medium">Login temporarily blocked</p>
                      <p className="mt-1">Unlocks in <span className="font-semibold">{fmt(blockRemaining)}</span>.</p>
                      <Link href="/auth/forgot-password" className="mt-1 inline-block font-medium text-red-700 underline">Reset password</Link>
                    </div>
                  )}
                  {needsVerification && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                      Your email is not verified yet.{' '}
                      <button type="button" onClick={handleResend} className="font-semibold text-[#047857] underline">
                        Resend verification email
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className={`w-full h-12 rounded-xl font-semibold text-[15px] transition flex items-center justify-center gap-2 ${
                      canSubmit && !loading
                        ? 'text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] hover:brightness-105'
                        : 'bg-[#D0D5DD] text-white cursor-not-allowed'
                    }`}
                    style={canSubmit && !loading ? { background: 'linear-gradient(95deg, #059669 0%, #0d9488 55%, #14b8a6 100%)' } : undefined}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {blocked ? `Blocked (${fmt(blockRemaining)})` : 'Continue'}
                  </button>
                </form>

                <p className="mt-6 text-center">
                  <Link href="/auth/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                    Forgot Password?
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f1f1f1]"><p className="text-[#98A2B3] text-sm">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
