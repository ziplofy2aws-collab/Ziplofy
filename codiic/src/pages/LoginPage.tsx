import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import MintAuthShell from '../components/MintAuthShell';
import { FlowButton, FlowButtonLoading } from '../components/ui/flow-button';
import { useAuth } from '../contexts/auth.context';

interface LoginFormData {
  email: string;
  password: string;
}

const fieldClass =
  'w-full h-12 rounded-xl border border-[#e3e3e3] bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setLoading(true);
      setErr('');
      try {
        await login(form.email, form.password);
      } catch (error: any) {
        setErr(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            'Login failed',
        );
      } finally {
        setLoading(false);
      }
    },
    [login, form.email, form.password],
  );

  const handleGoogleSuccess = useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const googleJwtToken = cred.credential;
        if (!googleJwtToken) throw new Error('Google JWT token is required');
        await googleLogin(googleJwtToken);
      } catch (error: any) {
        setErr(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            'Google sign-in failed',
        );
      }
    },
    [googleLogin],
  );

  const handleGoogleError = useCallback((): void => {
    setErr('Google sign-in failed');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <MintAuthShell title="Welcome back" subtitle="Log in to continue to your Codiic dashboard.">
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <label className="block text-[13px] font-bold text-slate-800">
          Email address
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            required
            autoComplete="email"
            className={`${fieldClass} mt-1.5`}
            placeholder="example@gmail.com"
          />
        </label>
        <label className="block text-[13px] font-bold text-slate-800">
          Password
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            required
            autoComplete="current-password"
            className={`${fieldClass} mt-1.5`}
            placeholder="Enter your password"
          />
        </label>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {loading ? (
          <FlowButtonLoading text="Signing in…" />
        ) : (
          <FlowButton type="submit" text="Sign in" />
        )}
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-emerald-900/10" />
        </div>
        <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span className="bg-white/80 px-2">or</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-emerald-700 underline hover:text-emerald-800">
          Sign up
        </Link>
      </p>
    </MintAuthShell>
  );
}
