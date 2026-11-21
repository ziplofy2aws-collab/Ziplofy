import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useCallback, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import MintAuthShell from '../components/MintAuthShell';
import { useAuth } from '../contexts/auth.context';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const fieldBase =
  'w-full rounded-xl border border-[#DCE3DF] bg-white py-3 text-[15px] text-[#171923] outline-none transition placeholder:text-[#8A919C] focus:border-[#00B879] focus:ring-4 focus:ring-[#00B879]/15';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <MintAuthShell
      mode="signup"
      googleButton={
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          width={360}
          containerProps={{
            className:
              'absolute inset-0 flex w-full items-center justify-center overflow-hidden opacity-[0.01]',
            style: { height: '100%' },
          }}
        />
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">
          Business name
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            className={`${fieldBase} mt-1.5 px-4`}
            placeholder="Sharma Traders"
          />
        </label>

        <label className="block text-sm font-semibold">
          Email
          <span className="relative mt-1.5 block">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className={`${fieldBase} pl-11 pr-4`}
              placeholder="you@company.in"
            />
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Password
          <span className="relative mt-1.5 block">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleInputChange}
              required
              minLength={8}
              autoComplete="new-password"
              className={`${fieldBase} pl-11 pr-12`}
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-[#8A919C] hover:text-[#171923]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Confirm password
          <span className="relative mt-1.5 block">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A919C]" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
              className={`${fieldBase} pl-11 pr-4`}
              placeholder="Confirm your password"
            />
          </span>
        </label>

        {err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00B879] py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(0,143,96,0.7)] transition-colors hover:bg-[#008F60] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </MintAuthShell>
  );
}
