import { deviceLabel, type LiveDeviceType } from './device.util';
import type { LiveGeoLocation } from './geo.util';

export type LiveFunnelStage = 'browsing' | 'cart' | 'checkout';
export type LiveVisitorType = 'new' | 'returning';

export type LiveSessionPresence = {
  storeId: string;
  sessionId: string;
  device: LiveDeviceType;
  location: LiveGeoLocation;
  stage: LiveFunnelStage;
  visitorType: LiveVisitorType;
  joinedAt: number;
};

export type LiveSessionsSnapshot = {
  storeId: string;
  total: number;
  activeCarts: number;
  checkingOut: number;
  newCustomers: number;
  returningCustomers: number;
  byDevice: Array<{ key: LiveDeviceType; name: string; value: number }>;
  byLocation: Array<{ name: string; value: number; path: string }>;
  locationBreadcrumb: string | null;
};

/** socketId -> presence */
const presenceBySocket = new Map<string, LiveSessionPresence>();
/** storeId -> set of socketIds */
const socketsByStore = new Map<string, Set<string>>();

export function analyticsRoom(storeId: string): string {
  return `analytics:store:${storeId}`;
}

export function normalizeFunnelStage(value: unknown): LiveFunnelStage | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (key === 'browsing' || key === 'cart' || key === 'checkout') return key;
  return null;
}

export function normalizeVisitorType(value: unknown): LiveVisitorType | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (key === 'new' || key === 'returning') return key;
  return null;
}

export function getLiveSession(socketId: string): LiveSessionPresence | undefined {
  return presenceBySocket.get(socketId);
}

export function upsertLiveSession(socketId: string, presence: LiveSessionPresence): void {
  const prev = presenceBySocket.get(socketId);
  if (prev && prev.storeId !== presence.storeId) {
    removeSocketFromStoreIndex(prev.storeId, socketId);
  }

  presenceBySocket.set(socketId, presence);

  let set = socketsByStore.get(presence.storeId);
  if (!set) {
    set = new Set();
    socketsByStore.set(presence.storeId, set);
  }
  set.add(socketId);
}

export function removeLiveSession(socketId: string): string | null {
  const prev = presenceBySocket.get(socketId);
  if (!prev) return null;
  presenceBySocket.delete(socketId);
  removeSocketFromStoreIndex(prev.storeId, socketId);
  return prev.storeId;
}

function removeSocketFromStoreIndex(storeId: string, socketId: string): void {
  const set = socketsByStore.get(storeId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) socketsByStore.delete(storeId);
}

export function getLiveSessionsSnapshot(storeId: string): LiveSessionsSnapshot {
  const socketIds = socketsByStore.get(storeId);
  const sessions: LiveSessionPresence[] = [];
  if (socketIds) {
    for (const id of socketIds) {
      const row = presenceBySocket.get(id);
      if (row) sessions.push(row);
    }
  }

  const deviceCounts: Record<LiveDeviceType, number> = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    other: 0,
  };
  const locationCounts = new Map<string, { name: string; path: string; value: number }>();
  let activeCarts = 0;
  let checkingOut = 0;
  let newCustomers = 0;
  let returningCustomers = 0;

  for (const session of sessions) {
    deviceCounts[session.device] += 1;
    if (session.stage === 'cart') activeCarts += 1;
    if (session.stage === 'checkout') checkingOut += 1;
    if (session.visitorType === 'returning') returningCustomers += 1;
    else newCustomers += 1;

    const locKey = session.location.path || 'Unknown';
    const existing = locationCounts.get(locKey);
    if (existing) {
      existing.value += 1;
    } else {
      locationCounts.set(locKey, {
        name: session.location.city || session.location.country || 'Unknown',
        path: locKey,
        value: 1,
      });
    }
  }

  const byDevice = (Object.keys(deviceCounts) as LiveDeviceType[])
    .filter((key) => deviceCounts[key] > 0)
    .map((key) => ({
      key,
      name: deviceLabel(key),
      value: deviceCounts[key],
    }))
    .sort((a, b) => b.value - a.value);

  const byLocation = Array.from(locationCounts.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  let locationBreadcrumb: string | null = null;
  if (byLocation.length === 1) {
    locationBreadcrumb = byLocation[0]?.path ?? null;
  } else if (byLocation.length > 1) {
    locationBreadcrumb = byLocation[0]?.path ?? null;
  }

  return {
    storeId,
    total: sessions.length,
    activeCarts,
    checkingOut,
    newCustomers,
    returningCustomers,
    byDevice,
    byLocation,
    locationBreadcrumb,
  };
}
