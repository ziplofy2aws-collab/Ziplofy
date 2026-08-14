const PLACEHOLDER_STORE_NAMES = ["my store", "user's store"];

function normalizeStoreName(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function defaultStoreNameCandidates(owner?: { name?: string | null; email?: string | null }): string[] {
  const ownerName = owner?.name?.trim() || "";
  const emailLocal = owner?.email?.split("@")[0]?.trim() || "";
  const displayName = ownerName || emailLocal || "User";

  return [
    `${displayName}'s Store`,
    `${displayName}'s store`,
    emailLocal ? `${emailLocal}'s Store` : "",
    emailLocal ? `${emailLocal}'s store` : "",
    "User's Store",
    "My Store",
  ]
    .map(normalizeStoreName)
    .filter(Boolean);
}

export function isGeneratedDefaultStoreName(
  storeName: string | null | undefined,
  owner?: { name?: string | null; email?: string | null },
): boolean {
  const normalized = normalizeStoreName(storeName);
  if (normalized.length < 2) return true;
  if (PLACEHOLDER_STORE_NAMES.includes(normalized)) return true;
  return defaultStoreNameCandidates(owner).includes(normalized);
}

export function hasCustomStoreName(params: {
  storeName?: string | null;
  generalStoreName?: string | null;
  owner?: { name?: string | null; email?: string | null };
}): boolean {
  const names = [params.storeName, params.generalStoreName].filter(
    (name): name is string => Boolean(name && name.trim()),
  );
  if (names.length === 0) return false;
  return names.some((name) => !isGeneratedDefaultStoreName(name, params.owner));
}
