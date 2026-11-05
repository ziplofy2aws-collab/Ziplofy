import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api, applySession, clearToken, getToken, goToSso } from './api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function SessionRedirect({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(!getToken());

  useEffect(() => {
    if (location.pathname === '/logout') {
      clearToken();
      navigate('/login', { replace: true });
      return;
    }
    if (!getToken()) {
      setReady(true);
      return;
    }
    let cancelled = false;
    api
      .me()
      .then((data) => {
        if (cancelled) return;
        applySession(data);
        if (data.redirect?.ssoUrl) {
          goToSso(data.redirect.ssoUrl);
          return;
        }
        const next = data.nextPath || '/login';
        const publicAuth = location.pathname === '/login' || location.pathname === '/register';
        if (publicAuth && next && next !== location.pathname) {
          navigate(next, { replace: true });
        }
        // Legacy wizard routes → login (SSO happens after verified login).
        if (
          location.pathname === '/choose-industry' ||
          location.pathname === '/business-name' ||
          location.pathname === '/launching'
        ) {
          navigate('/login', { replace: true });
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  if (!ready) {
    return (
      <div className="shell">
        <div className="card">
          <p className="sub">Loading your account…</p>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const routes = (
    <SessionRedirect>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/choose-industry" element={<Navigate to="/login" replace />} />
        <Route path="/business-name" element={<Navigate to="/login" replace />} />
        <Route path="/launching" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </SessionRedirect>
  );

  if (!googleClientId) return routes;
  return <GoogleOAuthProvider clientId={googleClientId}>{routes}</GoogleOAuthProvider>;
}
