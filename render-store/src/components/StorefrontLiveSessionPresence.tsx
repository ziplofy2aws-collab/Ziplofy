import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStorefront } from '../contexts/store.context';
import { useStorefrontAuth } from '../contexts/storefront-auth.context';
import { useStorefrontCart } from '../contexts/storefront-cart.context';
import {
  resolveVisitorType,
  type LiveVisitorType,
} from '../utils/live-visitor.util';

const SOCKET_EVENT = {
  ClientSessionJoin: 'client:session:join',
  ClientSessionLeave: 'client:session:leave',
} as const;

const SESSION_KEY = 'codiic_live_session_id';

type FunnelStage = 'browsing' | 'cart' | 'checkout';

function resolveSocketUrl(): string {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim().replace(/\/$/, '');
  }
  const api = import.meta.env.VITE_API_URL;
  if (typeof api === 'string' && api.trim()) {
    return api.trim().replace(/\/$/, '').replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:5000';
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' | 'other' {
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|Kindle|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry/i.test(ua)) return 'mobile';
  if (ua) return 'desktop';
  return 'other';
}

function resolveFunnelStage(pathname: string, cartCount: number): FunnelStage {
  const path = pathname.toLowerCase();
  const onCheckout =
    path.startsWith('/checkout') && !path.includes('thank-you') && !path.includes('order-status');
  if (onCheckout) return 'checkout';
  if (cartCount > 0) return 'cart';
  return 'browsing';
}

function useWindowPathname(): string {
  const [pathname, setPathname] = useState(
    () => (typeof window !== 'undefined' ? window.location.pathname : '/'),
  );

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);

    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);

    history.pushState = ((...args: Parameters<History['pushState']>) => {
      originalPush(...args);
      sync();
    }) as History['pushState'];

    history.replaceState = ((...args: Parameters<History['replaceState']>) => {
      originalReplace(...args);
      sync();
    }) as History['replaceState'];

    return () => {
      window.removeEventListener('popstate', sync);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, []);

  return pathname;
}

type PresenceFingerprint = {
  stage: FunnelStage;
  visitorType: LiveVisitorType;
  customerId: string | null;
};

/**
 * Emits live storefront presence (device, location, funnel stage, new/returning)
 * so admin Live View can show sessions + customer behavior in real time.
 */
export function StorefrontLiveSessionPresence() {
  const { storeFrontMeta, storeFrontChecked, isStoreFront } = useStorefront();
  const { items, guestItems, isGuest } = useStorefrontCart();
  const { user, initializing } = useStorefrontAuth();
  const pathname = useWindowPathname();
  const socketRef = useRef<Socket | null>(null);
  const metaRef = useRef({ storeId: '', sessionId: '', deviceType: detectDeviceType() });
  const lastFingerprintRef = useRef<string | null>(null);
  const [visitorEpoch, setVisitorEpoch] = useState(0);

  useEffect(() => {
    const bump = () => setVisitorEpoch((n) => n + 1);
    window.addEventListener('codiic:live-visitor-updated', bump);
    return () => window.removeEventListener('codiic:live-visitor-updated', bump);
  }, []);

  const cartCount = isGuest ? guestItems.length : items.length;
  const stage = useMemo(
    () => resolveFunnelStage(pathname, cartCount),
    [pathname, cartCount],
  );

  const visitorType = useMemo(() => {
    const storeId = storeFrontMeta?.storeId;
    if (!storeId) return 'new' as LiveVisitorType;
    return resolveVisitorType({ storeId, user });
  }, [storeFrontMeta?.storeId, user, visitorEpoch]);

  const customerId = user?._id ?? null;

  const fingerprint = useMemo<PresenceFingerprint>(
    () => ({ stage, visitorType, customerId }),
    [stage, visitorType, customerId],
  );
  const fingerprintRef = useRef(fingerprint);
  fingerprintRef.current = fingerprint;

  useEffect(() => {
    if (!storeFrontChecked || !isStoreFront || !storeFrontMeta?.storeId) return;
    if (initializing) return;

    const storeId = storeFrontMeta.storeId;
    const sessionId = getOrCreateSessionId();
    const deviceType = detectDeviceType();
    metaRef.current = { storeId, sessionId, deviceType };

    const socket = io(resolveSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 20000,
      auth: { clientRole: 'storefront' },
      extraHeaders: { 'x-client-role': 'storefront' },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const emitJoin = (next: PresenceFingerprint) => {
      lastFingerprintRef.current = JSON.stringify(next);
      socket.emit(SOCKET_EVENT.ClientSessionJoin, {
        storeId,
        sessionId,
        deviceType,
        stage: next.stage,
        visitorType: next.visitorType,
        ...(next.customerId ? { customerId: next.customerId } : {}),
      });
    };

    socket.on('connect', () => emitJoin(fingerprintRef.current));

    const onVisible = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
        emitJoin(fingerprintRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (socket.connected) {
        socket.emit(SOCKET_EVENT.ClientSessionLeave, { storeId, sessionId });
      }
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
      lastFingerprintRef.current = null;
    };
  }, [storeFrontChecked, isStoreFront, storeFrontMeta?.storeId, initializing]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    const key = JSON.stringify(fingerprint);
    if (lastFingerprintRef.current === key) return;
    const { storeId, sessionId, deviceType } = metaRef.current;
    if (!storeId) return;
    lastFingerprintRef.current = key;
    socket.emit(SOCKET_EVENT.ClientSessionJoin, {
      storeId,
      sessionId,
      deviceType,
      stage: fingerprint.stage,
      visitorType: fingerprint.visitorType,
      ...(fingerprint.customerId ? { customerId: fingerprint.customerId } : {}),
    });
  }, [fingerprint]);

  return null;
}
