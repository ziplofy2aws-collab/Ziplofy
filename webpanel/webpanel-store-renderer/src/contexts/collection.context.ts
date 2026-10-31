/** Type + stub for codiic collection context — webpanel storefronts have no collections. */

export type Collection = {
  _id: string;
  storeId?: string;
  title?: string;
  name?: string;
  urlHandle?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
};

export function useCollections() {
  return {
    collections: [] as Collection[],
    loading: false,
    error: null as string | null,
    fetchCollectionsByStoreId: async (_storeId: string) => [] as Collection[],
  };
}
