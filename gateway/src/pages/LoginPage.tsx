import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, applySession, goToSso } from '../api';
import Shell from '../components/Shell';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSession(promise: Promise<import('../types').SessionResponse>) {
    const data = await promise;
    applySession(data);
    if (data.redirect?.ssoUrl) {
      goToSso(data.redirect.ssoUrl);
      return;
    }
    navigate(data.nextPath || '/choose-industry');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await handleSession(api.login({ email, password }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>
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
