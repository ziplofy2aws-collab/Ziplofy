import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api, applySession } from '../api';
import AuthSplit, { AuthSubmitButton } from '../components/AuthSplit';
import { continueAfterSession } from '../lib/sessionNav';

const fieldBase =
  'w-full rounded-xl border border-[#DCE3DF] bg-white py-3 text-[15px] text-[#171923] outline-none transition placeholder:text-[#8A919C] focus:border-[#00B879] focus:ring-4 focus:ring-[#00B879]/15 disabled:cursor-not-allowed disabled:opacity-60';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSession(promise: Promise<import('../types').SessionResponse>) {
    const data = await promise;
    applySession(data);
    continueAfterSession(data, navigate);
  }

  async function onSendOtp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    const errors = {
      name: CHECKS.name(name),
      email: CHECKS.email(email),
      phone: CHECKS.phone(phone),
      password: CHECKS.password(password),
      confirmPassword: password !== confirmPassword ? 'Passwords do not match' : '',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      const data = await api.register({ name, email, password, phone: `+91${phone}` });
      if (data.needsVerification) {
        setOtpEmail(data.email || email);
        setAwaitingOtp(true);
        setDevOtp(data.devOtp || '');
        if (data.devOtp) setOtpCode(data.devOtp);
        setInfo(
          data.emailSent === false && data.devOtp
            ? `Email could not be sent. Use this code: ${data.devOtp}`
            : data.message || 'Enter the verification code sent to your email.'
        );
        return;
      }
      await handleSession(Promise.resolve(data as import('../types').SessionResponse));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.verifyEmailOtp({ email: otpEmail, code: otpCode.trim() });
      setInfo('Email verified. Redirecting to login…');
      navigate('/login', { replace: true, state: { email: otpEmail, verified: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const data = await api.resendEmailOtp({ email: otpEmail || email });
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
        !awaitingOtp && import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <GoogleLogin
            onSuccess={onGoogle}
            onError={() => setError('Google sign-in failed')}
            width={360}
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

      <form className="space-y-4" onSubmit={awaitingOtp ? onVerifyOtp : onSendOtp}>
        <label className="block text-sm font-semibold" htmlFor="name">
          Full name
          <input
            id="name"
            className={`${fieldBase} mt-1.5 px-4`}
            value={name}
            onChange={(e) => { const v = e.target.value; setName(v); setFieldErrors((p) => ({ ...p, name: CHECKS.name(v) })); }}
            placeholder="Your name"
            required
            disabled={awaitingOtp || loading}
          />
        </label>

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
              disabled={awaitingOtp || loading}
            />
          </span>
        </label>

        <label className="block text-sm font-semibold" htmlFor="phone">
          Phone number
          <input
            id="phone"
            className={`${fieldBase} mt-1.5 px-4`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            disabled={awaitingOtp || loading}
          />
        </label>

        <label className="block text-sm font-semibold" htmlFor="password">
          Password
          <span className="relative mt-1.5 block">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
            <input
              id="password"
              className={`${fieldBase} pl-11 pr-12`}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              required
              disabled={awaitingOtp || loading}
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
        </label>

        <label className="block text-sm font-semibold" htmlFor="confirmPassword">
          Confirm password
          <span className="relative mt-1.5 block">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
            <input
              id="confirmPassword"
              className={`${fieldBase} pl-11 pr-12`}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              placeholder="Retype your password"
              autoComplete="new-password"
              required
              disabled={awaitingOtp || loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-[#8A919C] hover:text-[#171923]"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword((v) => !v)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        {!awaitingOtp ? (
          <AuthSubmitButton
            text="Create workspace"
            loadingText="Sending code…"
            loading={loading}
          />
        ) : (
          <>
            {devOtp ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                Dev code: <strong>{devOtp}</strong>
              </p>
            ) : null}
            <label className="block text-sm font-semibold" htmlFor="otp">
              Email verification code
              <input
                id="otp"
                className={`${fieldBase} mt-1.5 px-4`}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </label>
            <AuthSubmitButton
              text="Verify & continue to login"
              loadingText="Verifying…"
              loading={loading}
              disabled={otpCode.trim().length < 4}
            />
          </>
        )}
      </form>

      {awaitingOtp ? (
        <p className="mt-5 text-center text-sm text-[#5A6270]">
          <button
            type="button"
            className="cursor-pointer font-semibold text-[#008F60] hover:underline disabled:opacity-60"
            onClick={onResend}
            disabled={loading}
          >
            Resend OTP
          </button>
          {' · '}
          <button
            type="button"
            className="cursor-pointer font-semibold text-[#008F60] hover:underline"
            onClick={() => {
              setAwaitingOtp(false);
              setOtpCode('');
              setDevOtp('');
              setInfo('');
              setError('');
            }}
          >
            Edit details
          </button>
        </p>
      ) : null}
    </AuthSplit>
  );
}
