'use client';

/**
 * Webpanel adapter for codiic `useStoreCheckoutConfigurations`.
 * Webpanel stores have no checkout-profile configs — stubbed (theme mode only).
 */

import { useCallback, useMemo, useState } from 'react';

export type StoreCheckoutConfiguration = {
  _id?: string;
  storeId?: string;
  configurationName?: string;
  checkoutConfig?: Record<string, unknown>;
};

export function useStoreCheckoutConfigurations() {
  const [configuration] = useState<StoreCheckoutConfiguration | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const getById = useCallback(async (_id: string) => {
    throw new Error('Checkout profile editor is not available for webpanel stores');
  }, []);

  const getByStoreId = useCallback(async (_storeId: string) => null, []);
  const create = useCallback(async (_payload: Record<string, unknown>) => null, []);
  const update = useCallback(async (_id: string, _payload: Record<string, unknown>) => null, []);
  const deleteConfiguration = useCallback(async (_id: string) => undefined, []);
  const clear = useCallback(() => undefined, []);
  const clearError = useCallback(() => undefined, []);

  return useMemo(
    () => ({
      configuration,
      loading,
      error,
      getById,
      getByStoreId,
      create,
      update,
      deleteConfiguration,
      clear,
      clearError,
    }),
    [configuration, loading, error, getById, getByStoreId, create, update, deleteConfiguration, clear, clearError]
  );
}
