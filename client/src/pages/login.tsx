import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ziplofyLogo from '../assets/ziplofy-logo.png';
import SlantedImageCarouselWrapper from '../components/SlantedImageCarouselWrapper';
import { useAuth } from '../contexts/auth.context';

// Define types
interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { login, googleLogin } = useAuth();
  
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');

  const onSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    
    try {
      await login(form.email, form.password);
    } catch (error: any) {
      setErr(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [login, form.email, form.password]);

  const handleGoogleSuccess = useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const googleJwtToken = cred.credential;
        if(!googleJwtToken) {
          throw new Error('Google JWT token is required');
        }
        await googleLogin(googleJwtToken);
        // Navigation will be handled by the auth context useEffect
      } catch (error: any) {
        setErr(error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Google sign-in failed');
      }
    },
    [googleLogin]
  );

  const handleGoogleError = useCallback((): void => {
    setErr('Google sign-in failed');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <SlantedImageCarouselWrapper>
      <div className="w-full">
        <div className="bg-white backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
          <div className="px-8 py-8">
            <div className="flex flex-col gap-6">
              {/* Logo */}
              <div className="flex justify-center mb-2">
                <img src={ziplofyLogo} alt="Ziplofy" className="h-12 w-auto" />
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {err && (
                  <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      {err}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 active:bg-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
              
              {/* Sign up link */}
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SlantedImageCarouselWrapper>
  );
}