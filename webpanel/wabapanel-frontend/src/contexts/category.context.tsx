'use client';

/** Stub for codiic `useCategories` — webpanel stores have no product categories. */

import { useCallback, useMemo, useState } from 'react';

export type Category = {
  _id: string;
  name?: string;
  title?: string;
  parent?: string | null;
  children?: Category[];
  [key: string]: unknown;
};

export function useCategories() {
  const [categories] = useState<Category[]>([]);
  const noop = useCallback(async () => [] as Category[], []);
  return useMemo(
    () => ({
      categories,
      loading: false,
      error: null as string | null,
      fetchCategories: noop,
      fetchCategoryById: async () => null as Category | null,
      createCategory: async () => null as Category | null,
      updateCategory: async () => null as Category | null,
      deleteCategory: async () => undefined,
    }),
    [categories, noop]
  );
}
