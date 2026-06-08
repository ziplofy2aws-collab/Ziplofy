import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';
import { safeLocalStorage } from '../types/local-storage';

export type UserRoleType = 'superadmin' | 'support_admin' | 'developer_admin' | 'expert_panel' | 'client';

export type IUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  accessToken: string;
  assignedSupportDeveloperId: string;
  storeId?: string;
}

interface AuthContextType {
  user: IUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<IUser | null>(null);
  const [logoutHandled, setLogoutHandled] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
 
  const checkAuth = async () => {
    try {
      const accessToken = safeLocalStorage.getItem("accessToken")
      if (accessToken) {
        const {data} = await axiosi.get<IUser>('/auth/me');
        setUser(data);
      }
    } catch (error) {
      safeLocalStorage.removeItem("accessToken")
    }
    finally {
      setInitialized(true);
    }
  };
  
  // Top-priority: handle ?logout=true
  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldLogout = url.searchParams.get('logout') === 'true';
    if (shouldLogout) {
      safeLocalStorage.removeItem('accessToken');
      setUser(null);
      url.searchParams.delete('logout');
      window.history.replaceState({}, '', url.toString());
    }
    setLogoutHandled(true);
  }, []);

  useEffect(() => {
    if (!logoutHandled) return;
    checkAuth();
  }, [logoutHandled]);

  // redirection handler
  useEffect(() => {
    if (!initialized) return;
    if (user) {
      const token = safeLocalStorage.getItem("accessToken")
      if (token) {
        const url = new URL(import.meta.env.VITE_REDIRECTION_URL);
        url.searchParams.set("accessToken", token);
        window.location.href = url.toString();
      }
    }
  }, [user, initialized]);

  const getErrorMessage = (error: any, fallback: string): string => {
    return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const {data} = await axiosi.post<IUser>('/auth/login', { email, password });
      safeLocalStorage.setItem("accessToken", data.accessToken)
      setUser(data);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = getErrorMessage(error, 'Login failed');
      console.error('Login error:', error);
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      const { data } = await axiosi.post<IUser>('/auth/register', { name, email, password });
      safeLocalStorage.setItem("accessToken", data.accessToken);
      setUser(data);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = getErrorMessage(error, 'Registration failed');
      console.error('Register error:', error);
      toast.error(message);
      throw error;
    }
  };

  const googleLogin = async (googleJwtToken: string): Promise<void> => {
    if (!googleJwtToken) {
      throw new Error('Google credential is missing');
    }
    try {
      const {data} = await axiosi.post<IUser>('/auth/google', { credential: googleJwtToken });
      safeLocalStorage.setItem("accessToken", data.accessToken)
      setUser(data);
      toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      const message = getErrorMessage(error, 'Google login failed');
      console.error('Google login error:', error);
      toast.error(message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      safeLocalStorage.removeItem("accessToken")
      setUser(null);
      window.location.reload(); // TODO: check if this is needed
    } finally {
      // nothing to do here
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
