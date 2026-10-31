'use client';

/** Stub for codiic `useLocations` — webpanel stores have no inventory locations. */

import { useCallback, useMemo, useState } from 'react';

export type Location = {
  _id: string;
  name?: string;
  address?: string;
  isDefault?: boolean;
  [key: string]: unknown;
};

export function useLocations() {
  const [locations] = useState<Location[]>([]);
  const noop = useCallback(async () => [] as Location[], []);
  return useMemo(
    () => ({
      locations,
      loading: false,
      error: null as string | null,
      fetchLocations: noop,
      fetchLocationsByStoreId: noop,
      defaultLocation: null as Location | null,
    }),
    [locations, noop]
  );
}
