import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { frontendEnv } from '../config/env';

interface UserContextType {
  loggedInUser: SecureUserInfo | null;
  fetchLoggedInUser: () => Promise<void>;
  clearUser: () => void;
}

export interface SecureUserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
  accessToken: string;
  assignedSupportDeveloperId: string;
  assignedSupportDeveloperDetails?:{
    name:string
    email:string
    id:string
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }:{children: React.ReactNode}) => {
  const [loggedInUser, setLoggedInUser] = useState<SecureUserInfo | null>(null);

  const redirectToAuth = useCallback(() => {
    const baseAuthUrl = frontendEnv.authMicroserviceFrontendUrl.replace(/\/+$/, '');
    const targetUrl = `${baseAuthUrl}?logout=true`;
    window.location.href = targetUrl;
  }, []);

  // Extract token from URL parameters on app load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    
    if (accessToken) {
      console.log('Token found in URL, setting in localStorage');
      localStorage.setItem("accessToken", accessToken);
      
      // Clean up URL by removing the token parameter
      params.delete("accessToken");
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const fetchLoggedInUser = useCallback(async () => {
    try {
     const {data} = await axiosi.get<SecureUserInfo>('/auth/me');
      setLoggedInUser(data);
    } catch (err: any) {
      console.error('Error fetching user:', err);
      
      // Handle 401 Unauthorized response
      if (err.response?.status === 401) {
        console.log('User unauthorized, clearing user state and redirecting to auth service');
        setLoggedInUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token'); // Fallback for any other tokens
        redirectToAuth();
      }
    }
  }, [redirectToAuth]);
  
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !loggedInUser) {
      fetchLoggedInUser();
    } else if (!accessToken && !loggedInUser) {
      redirectToAuth();
    }
  }, [fetchLoggedInUser, loggedInUser, redirectToAuth]);

  const clearUser = useCallback(() => {
    setLoggedInUser(null);
  }, []);

  const value = {
    loggedInUser,
    fetchLoggedInUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
