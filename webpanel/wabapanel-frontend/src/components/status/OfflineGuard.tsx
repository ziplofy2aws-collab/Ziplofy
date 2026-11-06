'use client';

import React, { useEffect, useState } from 'react';
import AppStatusScreen from './AppStatusScreen';

/**
 * Full-screen offline overlay. Mount once near the app root.
 */
export default function OfflineGuard() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== 'undefined' && !navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline) return null;
  return <AppStatusScreen variant="offline" />;
}
