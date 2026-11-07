import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, applySession } from '../api';
import AuthSplit from '../components/AuthSplit';
import { FlowButton, FlowButtonLoading } from '../components/ui/flow-button';
import { continueAfterSession } from '../lib/sessionNav';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSession(promise: Promise<import('../types').SessionResponse>) {
    const data = await promise;
    applySession(data);
    continueAfterSession(data, navigate);
  }

  async function onSendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const data = await api.register({ name, email, password, phone });
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
      title="Create your account"
      subtitle="Enter your details, then verify your email to continue."
    >
      {error ? <div className="auth-alert auth-alert--error">{error}</div> : null}
      {info ? <div className="auth-alert auth-alert--info">{info}</div> : null}

      <form className="auth-form" onSubmit={awaitingOtp ? onVerifyOtp : onSendOtp}>
        <label className="auth-label" htmlFor="name">
          Full name
        </label>
        <div className="auth-field">
          <input
            id="name"
            className="auth-input"
            style={{ paddingLeft: 14 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            disabled={awaitingOtp || loading}
          />
        </div>

        <label className="auth-label" htmlFor="email">
          Email
        </label>
        <div className="auth-field">
          <input
            id="email"
            className="auth-input"
            style={{ paddingLeft: 14 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={awaitingOtp || loading}
          />
        </div>

        <label className="auth-label" htmlFor="phone">
          Phone number
        </label>
        <div className="auth-field">
          <input
            id="phone"
            className="auth-input"
            style={{ paddingLeft: 14 }}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            disabled={awaitingOtp || loading}
          />
        </div>

        <label className="auth-label" htmlFor="password">
          Password
        </label>
        <div className="auth-field">
          <input
            id="password"
            className="auth-input"
            style={{ paddingLeft: 14 }}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            placeholder="Min 6 characters"
            required
            disabled={awaitingOtp || loading}
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

        {!awaitingOtp ? (
          loading ? (
            <FlowButtonLoading text="Sending code…" />
          ) : (
            <FlowButton type="submit" text="Verify email" className="w-full" />
          )
        ) : (
          <>
            {devOtp ? (
              <p className="auth-otp-hint">
                Dev code: <strong>{devOtp}</strong>
              </p>
            ) : null}
            <label className="auth-label" htmlFor="otp">
              Email verification code
            </label>
            <div className="auth-field">
              <input
                id="otp"
                className="auth-input"
                style={{ paddingLeft: 14 }}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
            {loading ? (
              <FlowButtonLoading text="Verifying…" />
            ) : (
              <FlowButton
                type="submit"
                text="Verify & continue to login"
                className="w-full"
                disabled={otpCode.trim().length < 4}
              />
            )}
          </>
        )}
      </form>

      {awaitingOtp ? (
        <p className="auth-switch">
          <button type="button" className="auth-text-btn" onClick={onResend} disabled={loading}>
            Resend OTP
          </button>
          {' · '}
          <button
            type="button"
            className="auth-text-btn"
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
      ) : (
        <>
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
                  width="360"
                />
              </div>
            </>
          ) : null}
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </>
      )}
    </AuthSplit>
  );
}
