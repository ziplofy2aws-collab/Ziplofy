import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, applySession, goToSso } from '../api';
import Shell from '../components/Shell';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
    if (data.redirect?.ssoUrl) {
      goToSso(data.redirect.ssoUrl);
      return;
    }
    navigate(data.nextPath || '/login');
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
    <Shell title="Create your account" subtitle="Enter your details, then verify your email to continue.">
      {error ? <div className="err">{error}</div> : null}
      {info ? <p className="sub">{info}</p> : null}

      <form onSubmit={awaitingOtp ? onVerifyOtp : onSendOtp}>
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={awaitingOtp || loading}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={awaitingOtp || loading}
        />
        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          required
          disabled={awaitingOtp || loading}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          disabled={awaitingOtp || loading}
        />

        {!awaitingOtp ? (
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Sending code…' : 'Verify email'}
          </button>
        ) : (
          <>
            {devOtp ? (
              <p className="sub" style={{ fontWeight: 600, letterSpacing: '0.12em', fontSize: '1.25rem' }}>
                {devOtp}
              </p>
            ) : null}
            <label htmlFor="otp">Email verification code</label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
            />
            <button className="btn" type="submit" disabled={loading || otpCode.trim().length < 4}>
              {loading ? 'Verifying…' : 'Verify & continue to login'}
            </button>
          </>
        )}
      </form>

      {awaitingOtp ? (
        <p className="switch">
          <button type="button" className="linkish" onClick={onResend} disabled={loading}>
            Resend OTP
          </button>
          {' · '}
          <button
            type="button"
            className="linkish"
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
            <div className="google">
              <GoogleLogin onSuccess={onGoogle} onError={() => setError('Google sign-in failed')} />
            </div>
          ) : null}
          <p className="switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </>
      )}
    </Shell>
  );
}
