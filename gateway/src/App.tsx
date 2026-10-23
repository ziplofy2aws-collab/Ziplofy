import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api, applySession, clearToken, getToken, goToSso } from './api';
import BusinessNamePage from './pages/BusinessNamePage';
import IndustryPage from './pages/IndustryPage';
import LaunchingPage from './pages/LaunchingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

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
        const next = data.nextPath || '/choose-industry';
        const publicAuth = location.pathname === '/login' || location.pathname === '/register';
        if (publicAuth) navigate(next, { replace: true });
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
      <Route
        path="/choose-industry"
        element={
          <RequireAuth>
            <IndustryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/business-name"
        element={
          <RequireAuth>
            <BusinessNamePage />
          </RequireAuth>
        }
      />
      <Route
        path="/launching"
        element={
          <RequireAuth>
            <LaunchingPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </SessionRedirect>
  );

  if (!googleClientId) return routes;
  return <GoogleOAuthProvider clientId={googleClientId}>{routes}</GoogleOAuthProvider>;
}
