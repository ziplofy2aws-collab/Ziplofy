export type CustomerDetailsLocationState = {
  customerJustCreated?: boolean;
};

export function readCustomerJustCreated(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return Boolean((state as CustomerDetailsLocationState).customerJustCreated);
}
