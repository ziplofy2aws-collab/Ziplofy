import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { IUser } from '../models/user';

const mocks = vi.hoisted(() => ({
  Store: { create: vi.fn(), prototype: {} as Record<string, unknown> },
  LocationModel: { create: vi.fn() },
  GeneralSettings: { create: vi.fn() },
  NotificationSettings: { create: vi.fn() },
  StoreSubdomain: { create: vi.fn() },
  createDefaultMarket: vi.fn(),
}));

const mockUser: IUser = {
  _id: { toString: () => 'user-123' } as unknown as IUser['_id'],
  name: 'Test User',
  email: 'test@example.com',
  provider: 'local',
  role: 'role-id' as unknown as IUser['role'],
  status: 'Active',
  totalPurchases: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('../models/store', () => ({ Store: mocks.Store }));
vi.mock('../models/location.model', () => ({ LocationModel: mocks.LocationModel }));
vi.mock('../models/general-settings.model', () => ({ GeneralSettings: mocks.GeneralSettings }));
vi.mock('../models/notification-settings.model', () => ({ NotificationSettings: mocks.NotificationSettings }));
vi.mock('../models/store-subdomain', () => ({ StoreSubdomain: mocks.StoreSubdomain }));
vi.mock('./market.utils', () => ({ createDefaultMarket: (...args: unknown[]) => mocks.createDefaultMarket(...args) }));

import { createDefaultStore, createDefaultResourcesForNewUser } from './store.utils';

describe('createDefaultStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.Store.create.mockResolvedValue({
      _id: { toString: () => 'store-123' },
      defaultLocation: null,
      save: vi.fn().mockResolvedValue(undefined),
    });
    mocks.LocationModel.create.mockResolvedValue({
      _id: { toString: () => 'loc-123' },
    });
  });

  it('creates store and default location', async () => {
    const result = await createDefaultStore(mockUser);

    expect(mocks.Store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser._id,
        storeName: "Test User's Store",
      })
    );
    expect(mocks.LocationModel.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('uses email prefix when name is empty', async () => {
    const userWithoutName = { ...mockUser, name: '' };
    await createDefaultStore(userWithoutName);

    expect(mocks.Store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeName: "test's Store", // from email test@example.com -> "test" (prefix)
      })
    );
  });
});

describe('createDefaultResourcesForNewUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.Store.create.mockResolvedValue({
      _id: { toString: () => 'store-123' },
      defaultLocation: null,
      save: vi.fn().mockResolvedValue(undefined),
    });
    mocks.LocationModel.create.mockResolvedValue({ _id: 'loc-123' });
    mocks.GeneralSettings.create.mockResolvedValue({});
    mocks.NotificationSettings.create.mockResolvedValue({});
    mocks.StoreSubdomain.create.mockResolvedValue({});
    mocks.createDefaultMarket.mockResolvedValue(undefined);
  });

  it('creates store, settings, market, subdomain', async () => {
    await createDefaultResourcesForNewUser(mockUser);

    expect(mocks.Store.create).toHaveBeenCalled();
    expect(mocks.GeneralSettings.create).toHaveBeenCalled();
    expect(mocks.NotificationSettings.create).toHaveBeenCalled();
    expect(mocks.createDefaultMarket).toHaveBeenCalled();
    expect(mocks.StoreSubdomain.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: expect.anything(),
        subdomain: expect.stringMatching(/^test-user-[a-z0-9]{4}$/),
      })
    );
  });
});
