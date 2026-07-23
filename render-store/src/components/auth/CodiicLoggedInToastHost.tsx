import { useEffect, useRef } from 'react';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import {
  hasShownCodiicLoggedInToast,
  showCodiicLoggedInToast,
} from './showCodiicLoggedInToast';

/**
 * Shows the Codiic SSO-style toast once per tab session when a logged-in
 * customer visits the storefront (session restore).
 */
export function CodiicLoggedInToastHost() {
  const { user, initializing } = useStorefrontAuth();
  const { storeFrontMeta, storeFrontChecked } = useStorefront();
  const shownRef = useRef(false);

  useEffect(() => {
    if (initializing || !storeFrontChecked || !user || shownRef.current) return;
    if (hasShownCodiicLoggedInToast(user)) {
      shownRef.current = true;
      return;
    }

    shownRef.current = true;
    showCodiicLoggedInToast(user, { storeName: storeFrontMeta?.name });
  }, [initializing, storeFrontChecked, user, storeFrontMeta?.name]);

  return null;
}
