import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { useStorefront } from './store.context';
import {
  clearStorefrontUnlockToken,
  setStorefrontUnlockToken,
} from '../utils/storefront-unlock-token';

export type StorefrontAccessState = {
  checked: boolean;
  loading: boolean;
  passwordProtectionEnabled: boolean;
  messageToYourVisitors: string;
  unlocked: boolean;
  verifying: boolean;
  error: string | null;
};

type StorefrontAccessContextType = StorefrontAccessState & {
  verifyPassword: (password: string) => Promise<boolean>;
  refreshAccess: () => Promise<void>;
};

const defaultState: StorefrontAccessState = {
  checked: false,
  loading: false,
  passwordProtectionEnabled: false,
  messageToYourVisitors: '',
  unlocked: false,
  verifying: false,
  error: null,
};

const StorefrontAccessContext = createContext<StorefrontAccessContextType | undefined>(undefined);

export const StorefrontAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { storeFrontMeta, isStoreFront, loadStoreAssets } = useStorefront();
  const [state, setState] = useState<StorefrontAccessState>(defaultState);

  const refreshAccess = useCallback(async () => {
    const storeId = storeFrontMeta?.storeId;
    if (!storeId || !isStoreFront) {
      setState((prev) => ({ ...prev, checked: true, unlocked: true, passwordProtectionEnabled: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, unlocked: false }));

    try {
      // Access + theme assets in parallel (theme may already be in-flight from subdomain resolve).
      const [accessResult] = await Promise.all([
        axiosi.get<{
          success: boolean;
          data?: {
            passwordProtectionEnabled: boolean;
            messageToYourVisitors?: string;
            unlocked: boolean;
          };
        }>(`/storefront/${storeId}/access`),
        loadStoreAssets(),
      ]);

      const access = accessResult.data.data;
      const passwordProtectionEnabled = Boolean(access?.passwordProtectionEnabled);
      const unlocked = passwordProtectionEnabled ? Boolean(access?.unlocked) : true;

      setState({
        checked: true,
        loading: false,
        passwordProtectionEnabled,
        messageToYourVisitors: access?.messageToYourVisitors?.trim() || '',
        unlocked,
        verifying: false,
        error: null,
      });
    } catch {
      clearStorefrontUnlockToken();
      // Still try to load theme so the password page can render if needed.
      void loadStoreAssets();
      setState({
        checked: true,
        loading: false,
        passwordProtectionEnabled: true,
        messageToYourVisitors: '',
        unlocked: false,
        verifying: false,
        error: 'Could not verify store access. Please try again.',
      });
    }
  }, [storeFrontMeta?.storeId, isStoreFront, loadStoreAssets]);

  useEffect(() => {
    if (!storeFrontMeta?.storeId || !isStoreFront) return;
    void refreshAccess();
  }, [storeFrontMeta?.storeId, isStoreFront, refreshAccess]);

  const verifyPassword = useCallback(
    async (password: string) => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) return false;

      setState((prev) => ({ ...prev, verifying: true, error: null }));

      try {
        const { data } = await axiosi.post<{
          success: boolean;
          data?: { unlockToken?: string; messageToYourVisitors?: string };
          message?: string;
        }>(`/storefront/${storeId}/verify-password`, { password });

        const unlockToken = data.data?.unlockToken;
        if (!unlockToken) {
          setState((prev) => ({
            ...prev,
            verifying: false,
            error: 'Could not unlock storefront',
          }));
          return false;
        }

        setStorefrontUnlockToken(unlockToken);
        setState((prev) => ({
          ...prev,
          verifying: false,
          unlocked: true,
          error: null,
          messageToYourVisitors: data.data?.messageToYourVisitors?.trim() || prev.messageToYourVisitors,
        }));

        await loadStoreAssets();
        return true;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Incorrect password';
        clearStorefrontUnlockToken();
        setState((prev) => ({
          ...prev,
          verifying: false,
          unlocked: false,
          error: message,
        }));
        return false;
      }
    },
    [storeFrontMeta?.storeId, loadStoreAssets]
  );

  const value: StorefrontAccessContextType = {
    ...state,
    verifyPassword,
    refreshAccess,
  };

  return <StorefrontAccessContext.Provider value={value}>{children}</StorefrontAccessContext.Provider>;
};

export const useStorefrontAccess = (): StorefrontAccessContextType => {
  const ctx = useContext(StorefrontAccessContext);
  if (!ctx) {
    throw new Error('useStorefrontAccess must be used within a StorefrontAccessProvider');
  }
  return ctx;
};

/** Safe in theme-editor preview where StorefrontAccessProvider may be absent. */
export const useOptionalStorefrontAccess = (): StorefrontAccessContextType | null => {
  return useContext(StorefrontAccessContext) ?? null;
};

export default StorefrontAccessContext;
