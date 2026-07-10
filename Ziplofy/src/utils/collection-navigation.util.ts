export type CollectionDetailsLocationState = {
  collectionJustCreated?: boolean;
};

export function readCollectionJustCreated(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return Boolean((state as CollectionDetailsLocationState).collectionJustCreated);
}
