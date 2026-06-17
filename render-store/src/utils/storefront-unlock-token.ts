/** Session-only unlock token — cleared on full page reload. */
let sessionUnlockToken: string | null = null;

const LEGACY_UNLOCK_TOKEN_KEY = 'storefront_unlock_token';

function clearLegacyPersistedUnlockToken(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(LEGACY_UNLOCK_TOKEN_KEY);
  } catch {
    // ignore
  }
}

clearLegacyPersistedUnlockToken();

export function getStorefrontUnlockToken(): string | null {
  return sessionUnlockToken;
}

export function setStorefrontUnlockToken(token: string): void {
  sessionUnlockToken = token;
  clearLegacyPersistedUnlockToken();
}

export function clearStorefrontUnlockToken(): void {
  sessionUnlockToken = null;
  clearLegacyPersistedUnlockToken();
}
