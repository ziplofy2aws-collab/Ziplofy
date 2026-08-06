import { axiosi } from '../config/axios.config';
import { safeLocalStorage } from '../types/local-storage';

const AUTH_USER_ID_KEY = 'codiic_auth_user_id';
const LEGACY_COMPLETE_KEY = 'codiic_setup_onboarding_complete';
const GOALS_KEY = 'codiic_setup_onboarding_goals';

export const ONBOARDING_GOALS = [
  { id: 'sell_online', label: 'Sell online' },
  { id: 'sell_instore', label: 'Sell in-store' },
  { id: 'dropshipping', label: 'Dropshipping' },
  { id: 'digital_products', label: 'Sell digital products' },
  { id: 'move_store', label: 'Move existing store' },
] as const;

export type OnboardingGoalId = (typeof ONBOARDING_GOALS)[number]['id'];

function completeKeyForUser(userId: string): string {
  return `codiic_setup_onboarding_complete:${userId}`;
}

export function setAuthUserId(userId: string): void {
  safeLocalStorage.setItem(AUTH_USER_ID_KEY, userId);
}

export function getAuthUserId(): string | null {
  return safeLocalStorage.getItem(AUTH_USER_ID_KEY);
}

export function clearAuthUserId(): void {
  safeLocalStorage.removeItem(AUTH_USER_ID_KEY);
}

export function isOnboardingComplete(userId?: string | null): boolean {
  const id = userId || getAuthUserId();
  if (!id) return false;
  if (safeLocalStorage.getItem(completeKeyForUser(id)) === '1') return true;
  if (safeLocalStorage.getItem(LEGACY_COMPLETE_KEY) === '1') {
    markOnboardingComplete(id);
    safeLocalStorage.removeItem(LEGACY_COMPLETE_KEY);
    return true;
  }
  return false;
}

export function markOnboardingComplete(userId?: string | null): void {
  const id = userId || getAuthUserId();
  if (!id) return;
  safeLocalStorage.setItem(completeKeyForUser(id), '1');
}

export function saveOnboardingGoals(goalIds: string[]): void {
  safeLocalStorage.setItem(GOALS_KEY, JSON.stringify(goalIds));
}

export function getOnboardingGoals(): string[] {
  try {
    const raw = safeLocalStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function goToOnboarding(): void {
  window.location.assign('/onboarding');
}

export function goToDashboard(): void {
  window.location.assign('/');
}

export function goToDashboardFromOnboarding(): void {
  markOnboardingComplete();
  goToDashboard();
}

export type PersistOnboardingPayload = {
  goals?: string[];
  paymentMethod?: 'upi' | 'card' | null;
  paymentHint?: string;
  planName?: string;
  introPrice?: number;
  skipped?: boolean;
  completed?: boolean;
};

/** Save onboarding details to the API so super-admin can see them. */
export async function persistOnboarding(payload: PersistOnboardingPayload): Promise<void> {
  await axiosi.put('/auth/onboarding', payload);
}

export async function completeOnboardingAndGoToDashboard(
  payload: PersistOnboardingPayload
): Promise<void> {
  try {
    await persistOnboarding({
      goals: payload.goals ?? getOnboardingGoals(),
      ...payload,
      completed: payload.completed ?? true,
    });
  } catch (err) {
    console.error('Failed to persist onboarding', err);
  }
  goToDashboardFromOnboarding();
}

/** After login / register / Google — onboarding if details not filled yet. */
export function redirectAfterAuth(userId: string): void {
  setAuthUserId(userId);
  if (isOnboardingComplete(userId)) {
    goToDashboard();
  } else {
    goToOnboarding();
  }
}
