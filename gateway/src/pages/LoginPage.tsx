import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api, applySession } from '../api';
import AuthSplit, { AuthSubmitButton } from '../components/AuthSplit';
import { continueAfterSession } from '../lib/sessionNav';

const fieldBase =
  'w-full rounded-xl border border-[#DCE3DF] bg-white py-3 text-[15px] text-[#171923] outline-none transition placeholder:text-[#8A919C] focus:border-[#00B879] focus:ring-4 focus:ring-[#00B879]/15 disabled:cursor-not-allowed disabled:opacity-60';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as { email?: string; verified?: boolean };
  const [email, setEmail] = useState(locationState.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    locationState.verified ? 'Account verified. Log in to open your dashboard.' : ''
  );
  const [loading, setLoading] = useState(false);

  async function handleSession(promise: Promise<import('../types').SessionResponse>) {
    const data = await promise;
    applySession(data);
    continueAfterSession(data, navigate);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await handleSession(api.login({ email, password }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      const anyErr = err as Error & {
        needsVerification?: boolean;
        email?: string;
        emailSent?: boolean;
        devOtp?: string;
      };
      if (anyErr.needsVerification || /verify your email/i.test(message)) {
        setNeedsVerification(true);
        if (anyErr.email) setEmail(anyErr.email);
        setDevOtp(anyErr.devOtp || '');
        if (anyErr.devOtp) setOtpCode(anyErr.devOtp);
        setInfo(
          anyErr.devOtp
            ? `Email could not be sent. Use this code: ${anyErr.devOtp}`
            : message
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.verifyEmailOtp({ email, code: otpCode.trim() });
      setNeedsVerification(false);
      setInfo('Account verified. Enter your password to log in.');
      setOtpCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setLoading(true);
    setError('');
    try {
      const data = await api.resendEmailOtp({ email });
      setDevOtp(data.devOtp || '');
      if (data.devOtp) setOtpCode(data.devOtp);
      setInfo(
        data.emailSent === false && data.devOtp
          ? `Email could not be sent. Use this code: ${data.devOtp}`
          : data.message || 'Code resent'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle(cred: CredentialResponse) {
    if (!cred.credential) return;
    setError('');
    try {
      await handleSession(api.google(cred.credential));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <AuthSplit
      googleButton={
        import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            onSuccess={onGoogle}
            onError={() => setError('Google sign-in failed')}
            width={400}
            containerProps={{
              className:
                'absolute inset-0 flex w-full items-center justify-center overflow-hidden opacity-[0.01]',
              style: { height: '100%' },
            }}
          />
        ) : undefined
      }
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {info}
        </div>
      ) : null}

      {needsVerification ? (
        <form className="space-y-4" onSubmit={onVerifyOtp}>
          {devOtp ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              Dev code: <strong>{devOtp}</strong>
            </p>
          ) : null}
          <label className="block text-sm font-semibold" htmlFor="otp">
            Verification code
            <input
              id="otp"
              className={`${fieldBase} mt-1.5 px-4`}
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit code"
              required
            />
          </label>
          <AuthSubmitButton text="Verify account" loadingText="Verifying…" loading={loading} />
          <p className="text-center">
            <button
              type="button"
              className="cursor-pointer text-xs font-semibold text-[#008F60] hover:underline disabled:opacity-60"
              onClick={onResend}
              disabled={loading}
            >
              Resend OTP
            </button>
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold" htmlFor="email">
            Email
            <span className="relative mt-1.5 block">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
              <input
                id="email"
                className={`${fieldBase} pl-11 pr-4`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <div>
            <span className="flex items-center justify-between text-sm font-semibold">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="cursor-pointer text-xs font-semibold text-[#008F60] hover:underline"
                onClick={() =>
                  setInfo(
                    'Password reset isn’t wired for local yet — use Google sign-in or ask an admin.'
                  )
                }
              >
                Forgot password?
              </button>
            </span>
            <span className="relative mt-1.5 block">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
              <input
                id="password"
                className={`${fieldBase} pl-11 pr-12`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-[#8A919C] hover:text-[#171923]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </div>

          <AuthSubmitButton text="Log in" loadingText="Signing in…" loading={loading} />
        </form>
      )}
    </AuthSplit>
  );
}
