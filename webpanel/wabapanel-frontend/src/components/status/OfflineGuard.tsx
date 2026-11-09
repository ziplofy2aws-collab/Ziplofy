'use client';

import React, { useEffect, useState } from 'react';
import AppStatusScreen from './AppStatusScreen';

/** Full-screen offline overlay — loader only. */
export default function OfflineGuard() {
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== 'undefined' && !navigator.onLine);
    sync();
    setReady(true);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!ready || !offline) return null;
  return <AppStatusScreen variant="offline" />;
}
