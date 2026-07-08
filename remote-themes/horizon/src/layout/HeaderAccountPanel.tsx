import type { CSSProperties, RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useStorefront, useStorefrontAuth, type StorefrontUser } from '@render-store/sdk';

const PANEL_WIDTH = 360;

type PanelPosition = { top: number; left: number };

type Props = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  user: StorefrontUser | null;
  onSignOut?: () => void;
};

function panelPositionFromAnchor(anchor: HTMLElement | null): PanelPosition | null {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const left = Math.min(Math.max(12, rect.right - PANEL_WIDTH), window.innerWidth - PANEL_WIDTH - 12);
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
      const panel = document.getElementById('codiic-header-account-panel');
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
    fontFamily: 'inherit',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    border: '1px solid rgba(0,0,0,0.08)',
  };

  const footerLinks = (
    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
      <Link to="/my-orders" style={footerButtonStyle} onClick={onClose}>
        Orders
      </Link>
      <Link to="/profile" style={footerButtonStyle} onClick={onClose}>
        Profile
      </Link>
      <Link to="/preferences" style={footerButtonStyle} onClick={onClose}>
        Preferences
      </Link>
    </div>
  );

  return createPortal(
    <div
      id="codiic-header-account-panel"
      role="dialog"
      aria-label={user ? 'Account menu' : 'Sign in or create account'}
      style={panelStyle}
    >
      <div style={{ padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {user ? 'Account' : 'Sign in or create account'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: 'none', background: '#f1f1f1', borderRadius: 999, width: 32, height: 32, cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {user ? (
          <>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#707070' }}>
              Signed in as <strong>{user.email || 'your account'}</strong>
            </p>
            {onSignOut ? (
              <button type="button" onClick={() => { onClose(); void onSignOut(); }} style={{ border: 'none', background: 'transparent', color: '#005bd3', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                Sign out
              </button>
            ) : null}
            {footerLinks}
          </>
        ) : (
          <>
            <form onSubmit={(e) => void handleSignIn(e)}>
              <div style={{ display: 'grid', gap: 12 }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={fieldStyle} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={fieldStyle} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 14, padding: '13px 16px', borderRadius: 10, border: 'none', background: '#005bd3', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: 14 }}>
                <Link to="/auth/signup" onClick={onClose}>Create account</Link>
              </p>
            </form>
            {footerLinks}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
