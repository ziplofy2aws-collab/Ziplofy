import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, applySession } from '../api';
import AuthSplit from '../components/AuthSplit';
import { FlowButton, FlowButtonLoading } from '../components/ui/flow-button';
import { continueAfterSession } from '../lib/sessionNav';

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
    <AuthSplit title="Welcome back" subtitle="Log in to continue to your Codiic workspace.">
      {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
      {info ? <div className="auth-alert auth-alert--info">{info}</div> : null}

      {needsVerification ? (
        <form className="auth-form" onSubmit={onVerifyOtp}>
          {devOtp ? (
            <p className="auth-otp-hint">
              Dev code: <strong>{devOtp}</strong>
            </p>
          ) : null}
          <label className="auth-label" htmlFor="otp">
            Verification code
          </label>
          <div className="auth-field">
            <input
              id="otp"
              className="auth-input"
              style={{ paddingLeft: 14 }}
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          {loading ? (
            <FlowButtonLoading text="Verifying…" />
          ) : (
            <FlowButton type="submit" text="Verify account" className="w-full" />
          )}
          <p className="auth-switch">
            <button type="button" className="auth-text-btn" onClick={onResend} disabled={loading}>
              Resend OTP
            </button>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <div className="auth-field">
            <span className="auth-field__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m5 8 7 5.5L19 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <div className="auth-field">
            <span className="auth-field__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-field__toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c5 0 8.5 4.5 9.5 6-.4.7-1.3 2-2.8 3.3M6.1 6.2C4.4 7.5 3.3 9.1 2.5 11c1 1.5 4.5 6 9.5 6 1.2 0 2.3-.2 3.3-.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                  <path d="M2.5 12C3.5 10.5 7 6 12 6s8.5 4.5 9.5 6c-1 1.5-4.5 6-9.5 6s-8.5-4.5-9.5-6Z" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </button>
          </div>

          <div className="auth-row">
            <button
              type="button"
              className="auth-link"
              onClick={() =>
                setInfo('Password reset isn’t wired for local yet — use Google sign-in or ask an admin.')
              }
            >
              Forgot password?
            </button>
          </div>

          {loading ? (
            <FlowButtonLoading text="Signing in…" />
          ) : (
            <FlowButton type="submit" text="Log in" className="w-full" />
          )}
        </form>
      )}

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <>
          <div className="auth-divider">
            <span>Or continue with</span>
          </div>
          <div className="auth-google">
            <GoogleLogin
              onSuccess={onGoogle}
              onError={() => setError('Google sign-in failed')}
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="360"
            />
          </div>
        </>
      ) : null}

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthSplit>
  );
}
