import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useCallback, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import MintAuthShell from '../components/MintAuthShell';
import { FlowButton, FlowButtonLoading } from '../components/ui/flow-button';
import { useAuth } from '../contexts/auth.context';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const fieldClass =
  'w-full h-11 rounded-xl border border-[#e3e3e3] bg-white px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setLoading(true);
      setErr('');

      if (form.password !== form.confirmPassword) {
        setErr('Passwords do not match');
        setLoading(false);
        return;
      }

      try {
        await register(form.name, form.email, form.password);
      } catch (error: any) {
        setErr(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            'Registration failed',
        );
      } finally {
        setLoading(false);
      }
    },
    [form.name, form.email, form.password, form.confirmPassword, register],
  );

  const handleGoogleSuccess = useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const googleJwtToken = cred.credential;
        if (!googleJwtToken) {
          toast.error('Google JWT token is required');
          return;
        }
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
    <MintAuthShell title="Create account" subtitle="Start building your store with CODIIC.">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="block text-[13px] font-bold text-slate-800">
          Full name
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            className={`${fieldClass} mt-1.5`}
            placeholder="John Doe"
          />
        </label>
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
            autoComplete="new-password"
            className={`${fieldClass} mt-1.5`}
            placeholder="Enter your password"
          />
        </label>
        <label className="block text-[13px] font-bold text-slate-800">
          Confirm password
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            required
            autoComplete="new-password"
            className={`${fieldClass} mt-1.5`}
            placeholder="Confirm your password"
          />
        </label>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {loading ? (
          <FlowButtonLoading text="Creating account…" />
        ) : (
          <FlowButton type="submit" text="Create account" />
        )}
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-emerald-900/10" />
        </div>
        <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span className="bg-white/80 px-2">or</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 underline hover:text-emerald-800">
          Sign in
        </Link>
      </p>
    </MintAuthShell>
  );
}
