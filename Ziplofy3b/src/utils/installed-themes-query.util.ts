import { Types } from "mongoose";

/** Match legacy docs where `store`/`user` was saved as string or ObjectId. */
export function storeAndUserScopeOr(storeIdToUse: string) {
  const storeIdStr = String(storeIdToUse);
  const oid = Types.ObjectId.isValid(storeIdStr) ? new Types.ObjectId(storeIdStr) : null;
  const clauses: Record<string, unknown>[] = [
    { store: storeIdStr },
    { user: storeIdStr },
  ];
  if (oid) {
    clauses.push({ store: oid }, { user: oid });
  }
  return clauses;
}

/** Prefer ObjectId in new/updated documents when the id is valid. */
export function canonicalStoreRef(storeIdToUse: string) {
  const storeIdStr = String(storeIdToUse);
  return Types.ObjectId.isValid(storeIdStr) ? new Types.ObjectId(storeIdStr) : storeIdStr;
}
