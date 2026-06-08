import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "../config/axios";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleLevel: number;
};

type AdminAuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ twoFactorRequired?: boolean; email?: string } | void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => void | Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get("/auth/me");
        const response = res.data;
        
        console.log("🔍 Backend response from /auth/me:", response);
        
        // Extract user data from the nested response structure
        const me = response.data || response;
        
        console.log("🔍 Extracted user data:", me);
        
        const userData = {
          id: me.id,
          name: me.name,
          email: me.email,
          roleId: me.roleId,
          roleName: me.role || me.roleName, // Use role field from backend
          roleLevel: me.roleLevel,
        };
        
        setUser(userData);
        
        // Store user data in localStorage for persistence
        console.log("🔍 Storing user data in localStorage:", {
          role: me.role || me.roleName,
          superAdmin: me.superAdmin,
          userData
        });
        
        localStorage.setItem('userRole', me.role || me.roleName);
        localStorage.setItem('isSuperAdmin', me.superAdmin ? 'true' : 'false');
        localStorage.setItem('userEmail', me.email);
        localStorage.setItem('userData', JSON.stringify({
          role: me.role || me.roleName,
          superAdmin: me.superAdmin,
          email: me.email,
          ...userData
        }));
        
        console.log("🔍 Stored in localStorage:", {
          userRole: localStorage.getItem('userRole'),
          isSuperAdmin: localStorage.getItem('isSuperAdmin'),
          userEmail: localStorage.getItem('userEmail'),
          userData: localStorage.getItem('userData')
        });
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("userData");
        localStorage.removeItem("userRole");
        localStorage.removeItem("isSuperAdmin");
        localStorage.removeItem("userEmail");
      }
    })();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 2FA step 1
      try {
        const step1 = await axios.post('/auth/admin/login-step1', { email, password });
        const data = step1.data;
        const body = data.data || data;
        if (body.twoFactorRequired) {
          return { twoFactorRequired: true, email: body.context?.email || email };
        }
      } catch (e: any) {
        // Fallback to legacy login if 2FA endpoints not present
        if (!e?.response || e.response.status === 404 || e.response.status >= 500) {
          const res = await axios.post("/auth/admin/login", { email, password });
          const response = res.data;
          const { accessToken, user } = response.data || response;
          localStorage.setItem("admin_token", accessToken);
          setToken(accessToken);
          setUser(user);
          localStorage.setItem('userRole', user.role || user.roleName);
          localStorage.setItem('isSuperAdmin', user.superAdmin ? 'true' : 'false');
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userData', JSON.stringify({
            role: user.role || user.roleName,
            superAdmin: user.superAdmin,
            email: user.email,
            ...user
          }));
          return;
        }
        throw e;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/admin/verify-otp', { email, code });
      const response = res.data;
      const { accessToken, user } = response.data || response;
      localStorage.setItem("admin_token", accessToken);
      setToken(accessToken);
      setUser(user);
      localStorage.setItem('userRole', user.role || user.roleName);
      localStorage.setItem('isSuperAdmin', user.superAdmin ? 'true' : 'false');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userData', JSON.stringify({
        role: user.role || user.roleName,
        superAdmin: user.superAdmin,
        email: user.email,
        ...user
      }));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // Ignore - still clear local state
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isSuperAdmin");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    token,
    loading,
    login,
    verifyOtp,
    logout,
  }), [user, token, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};


