import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Types } from 'mongoose';

const mocks = vi.hoisted(() => ({
  Market: { create: vi.fn() },
  MarketIncludes: { updateOne: vi.fn() },
  MarketSettings: { updateOne: vi.fn() },
  countriesFindOne: vi.fn(),
  currenciesFindOne: vi.fn(),
}));

vi.mock('../models/market', () => ({ Market: mocks.Market }));
vi.mock('../models/market-includes', () => ({ MarketIncludes: mocks.MarketIncludes }));
vi.mock('../models/market-settings', () => ({ MarketSettings: mocks.MarketSettings }));
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();
  return {
    default: {
      ...actual,
      connection: {
        collection: vi.fn((name: string) => {
          if (name === 'countries') return { findOne: mocks.countriesFindOne };
          if (name === 'currencies') return { findOne: mocks.currenciesFindOne };
          return { findOne: vi.fn().mockResolvedValue(null) };
        }),
      },
    },
  };
});

import { createDefaultMarket } from './market.utils';

describe('createDefaultMarket', () => {
  const storeId = { toString: () => '507f1f77bcf86cd799439011' } as unknown as Types.ObjectId;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.Market.create.mockResolvedValue({
      _id: { toString: () => 'market-123' },
    });
    mocks.MarketIncludes.updateOne.mockResolvedValue({});
    mocks.MarketSettings.updateOne.mockResolvedValue({});
    mocks.countriesFindOne.mockResolvedValue({ _id: 'india-id' });
    mocks.currenciesFindOne.mockResolvedValue({ _id: 'inr-id' });
  });

  it('creates market with correct storeId, name, handle format', async () => {
    await createDefaultMarket(storeId);

    expect(mocks.Market.create).toHaveBeenCalledWith({
      storeId,
      name: 'India',
      handle: 'in-439011', // last 6 of storeId (507f1f77bcf86cd799439011)
      parentMarketId: null,
      isDefault: true,
      status: 'active',
    });
  });

  it('calls MarketIncludes.updateOne when India country is found', async () => {
    await createDefaultMarket(storeId);

    expect(mocks.countriesFindOne).toHaveBeenCalledWith(
      { iso2: 'IN' },
      { projection: { _id: 1 } }
    );
    expect(mocks.MarketIncludes.updateOne).toHaveBeenCalledWith(
      { marketId: expect.anything(), countryId: 'india-id' },
      { $setOnInsert: { marketId: expect.anything(), countryId: 'india-id' } },
      { upsert: true }
    );
  });

  it('calls MarketSettings.updateOne with expected defaults', async () => {
    await createDefaultMarket(storeId);

    expect(mocks.MarketSettings.updateOne).toHaveBeenCalledWith(
      { marketId: expect.anything() },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          storeId,
          marketId: expect.anything(),
          locale: 'en-IN',
          languageCode: 'en',
          countryCode: 'IN',
          subfolder: '/en-IN',
          isPrimary: true,
          salesTaxCollecting: false,
        }),
      }),
      { upsert: true }
    );
  });

  it('completes without throwing when countries lookup fails', async () => {
    mocks.countriesFindOne.mockRejectedValue(new Error('DB error'));

    await expect(createDefaultMarket(storeId)).resolves.not.toThrow();
    expect(mocks.Market.create).toHaveBeenCalled();
    expect(mocks.MarketSettings.updateOne).toHaveBeenCalled();
  });

  it('completes without throwing when Market creation fails', async () => {
    mocks.Market.create.mockRejectedValue(new Error('Market create failed'));

    await expect(createDefaultMarket(storeId)).resolves.not.toThrow();
  });
});
