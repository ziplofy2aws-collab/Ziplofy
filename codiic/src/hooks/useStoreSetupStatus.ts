import { useCallback, useEffect, useState } from 'react';
import { axiosi } from '../config/axios.config';
import { isStoreThemeChosen } from '../utils/store-setup-theme.util';

export type StoreSetupStatus = {
  hasProduct: boolean;
  hasPaymentMethod: boolean;
  hasCustomStoreName: boolean;
  hasChosenTheme: boolean;
};

const EMPTY_STATUS: StoreSetupStatus = {
  hasProduct: false,
  hasPaymentMethod: false,
  hasCustomStoreName: false,
  hasChosenTheme: false,
};

type SetupStatusResponse = {
  success: boolean;
  data?: {
    hasProduct?: boolean;
    hasPaymentMethod?: boolean;
    hasCustomStoreName?: boolean;
    setupComplete?: boolean;
  };
};

export function useStoreSetupStatus(storeId: string | null) {
  const [status, setStatus] = useState<StoreSetupStatus>(EMPTY_STATUS);
  const [loading, setLoading] = useState(Boolean(storeId));

  const refresh = useCallback(async () => {
    if (!storeId) {
      setStatus(EMPTY_STATUS);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosi.get<SetupStatusResponse>(`/stores/${storeId}/setup-status`);
      const data = res.data?.data ?? {};
      setStatus({
        hasProduct: Boolean(data.hasProduct),
        hasPaymentMethod: Boolean(data.hasPaymentMethod),
        hasCustomStoreName: Boolean(data.hasCustomStoreName),
        hasChosenTheme: isStoreThemeChosen(storeId),
      });
    } catch {
      setStatus({
        ...EMPTY_STATUS,
        hasChosenTheme: isStoreThemeChosen(storeId),
      });
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, loading, refresh };
}
