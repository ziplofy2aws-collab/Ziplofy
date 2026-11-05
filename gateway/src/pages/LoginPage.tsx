import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, applySession, goToSso } from '../api';
import Shell from '../components/Shell';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as { email?: string; verified?: boolean };
  const [email, setEmail] = useState(locationState.email || '');
  const [password, setPassword] = useState('');
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
    if (data.redirect?.ssoUrl) {
      goToSso(data.redirect.ssoUrl);
      return;
    }
    navigate(data.nextPath || '/login');
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
      // api throws Error with message; needsVerification comes from response body when we extend api
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
    <Shell title="Welcome back" subtitle="Log in to continue to your Codiic product.">
      {error ? <div className="err">{error}</div> : null}
      {info ? <p className="sub">{info}</p> : null}

      {needsVerification ? (
        <form onSubmit={onVerifyOtp}>
          {devOtp ? (
            <p className="sub" style={{ fontWeight: 600, letterSpacing: '0.12em', fontSize: '1.25rem' }}>
              {devOtp}
            </p>
          ) : null}
          <label htmlFor="otp">Verification code</label>
          <input
            id="otp"
            inputMode="numeric"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={6}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify account'}
          </button>
          <p className="switch">
            <button type="button" className="linkish" onClick={onResend} disabled={loading}>
              Resend OTP
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
      )}

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <div className="google">
          <GoogleLogin onSuccess={onGoogle} onError={() => setError('Google sign-in failed')} />
        </div>
      ) : null}
      <p className="switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </Shell>
  );
}
