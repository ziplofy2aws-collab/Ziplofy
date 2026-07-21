export type ProductDetailsLocationState = {
  productJustCreated?: boolean;
};

export function readProductJustCreated(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return Boolean((state as ProductDetailsLocationState).productJustCreated);
}
