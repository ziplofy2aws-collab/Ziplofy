import type { CSSProperties, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useStorefront, useStorefrontAuth, type StorefrontUser } from '@render-store/sdk';

const PANEL_WIDTH = 360;
const ACCENT = '#005bd3';

type PanelPosition = { top: number; left: number };

type Props = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  user: StorefrontUser | null;
  onSignOut?: () => void;
};

function HeaderIconOrders() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8V6a4 4 0 118 0v2M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeaderIconProfile() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function panelPositionFromAnchor(anchor: HTMLElement | null): PanelPosition | null {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const left = Math.min(
    Math.max(12, rect.right - PANEL_WIDTH),
    window.innerWidth - PANEL_WIDTH - 12
  );
  return { top: rect.bottom + 10, left };
}

const footerButtonStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #dedede',
  background: '#ffffff',
  color: '#121212',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
};

const fieldStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  borderRadius: 10,
  border: '1px solid #dedede',
  background: '#ffffff',
  fontSize: 15,
  color: '#121212',
  outline: 'none',
};

export function HeaderAccountPanel({ open, anchorRef, onClose, user, onSignOut }: Props) {
  const { storeFrontMeta } = useStorefront();
  const { login, loading } = useStorefrontAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);

  const updatePosition = useCallback(() => {
    setPosition(panelPositionFromAnchor(anchorRef.current));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      const panel = document.getElementById('ziplofy-header-account-panel');
      if (panel?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, anchorRef, onClose]);

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!storeFrontMeta?.storeId || !email.trim() || !password) return;
      try {
        await login({
          storeId: storeFrontMeta.storeId,
          email: email.trim(),
          password,
        });
        onClose();
      } catch {
        /* context shows toast */
      }
    },
    [email, login, onClose, password, storeFrontMeta?.storeId]
  );

  if (!open || !position) return null;

  const panelStyle: CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    width: PANEL_WIDTH,
    maxWidth: 'calc(100vw - 24px)',
    zIndex: 6000,
    borderRadius: 16,
    border: '1px solid #e8e8e8',
    background: '#ffffff',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.14)',
    fontFamily: 'inherit',
    color: '#121212',
  };

  const footerLinks = (
    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
      <Link to="/my-orders" style={footerButtonStyle} onClick={onClose}>
        <HeaderIconOrders />
        <span>Orders</span>
      </Link>
      <Link to="/profile" style={footerButtonStyle} onClick={onClose}>
        <HeaderIconProfile />
        <span>Profile</span>
      </Link>
    </div>
  );

  return createPortal(
    <div
      id="ziplofy-header-account-panel"
      role="dialog"
      aria-modal="false"
      aria-label={user ? 'Account menu' : 'Sign in or create account'}
      style={panelStyle}
    >
      <div style={{ padding: '20px 20px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: user ? 16 : 18,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
            {user ? 'Account' : 'Sign in or create account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 999,
              border: 'none',
              background: '#f1f1f1',
              color: '#121212',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {user ? (
          <>
            <p style={{ margin: '0 0 4px', fontSize: 14, color: '#707070' }}>
              Signed in as{' '}
              <span style={{ color: '#121212', fontWeight: 500 }}>
                {user.email || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'your account'}
              </span>
            </p>
            {onSignOut ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void onSignOut();
                }}
                style={{
                  marginTop: 8,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  color: ACCENT,
                  fontSize: 14,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign out
              </button>
            ) : null}
            {footerLinks}
          </>
        ) : (
          <>
            <form onSubmit={(e) => void handleSignIn(e)}>
              <div style={{ display: 'grid', gap: 12 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  aria-label="Email"
                  required
                  style={fieldStyle}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-label="Password"
                  required
                  style={fieldStyle}
                />
              </div>

              <p style={{ margin: '10px 0 0', textAlign: 'right' }}>
                <Link
                  to="/auth/forgot"
                  onClick={onClose}
                  style={{ color: ACCENT, fontSize: 13, textDecoration: 'underline' }}
                >
                  Forgot password?
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                style={{
                  width: '100%',
                  marginTop: 14,
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: ACCENT,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading || !email.trim() || !password ? 0.65 : 1,
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 14, color: '#707070' }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/signup"
                  onClick={onClose}
                  style={{ color: ACCENT, fontWeight: 600, textDecoration: 'underline' }}
                >
                  Create account
                </Link>
              </p>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginTop: 14,
                  fontSize: 14,
                  lineHeight: 1.45,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: ACCENT }}
                />
                <span>Email me with news and offers</span>
              </label>
            </form>

            {footerLinks}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
