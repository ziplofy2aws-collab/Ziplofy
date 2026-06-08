import mongoose from 'mongoose';
import { Market } from '../models/market';
import { MarketIncludes } from '../models/market-includes';
import { MarketSettings } from '../models/market-settings';

export async function createDefaultMarket(storeId: mongoose.Types.ObjectId): Promise<void> {
  try {
    const handle = `in-${storeId.toString().slice(-6)}`;
    const market = await Market.create({
      storeId,
      name: 'India',
      handle,
      parentMarketId: null,
      isDefault: true,
      status: 'active',
    });

    // Link India country to this default market via MarketIncludes
    try {
      const india = await mongoose.connection
        .collection('countries')
        .findOne({ iso2: 'IN' }, { projection: { _id: 1 } });
      if (india?._id) {
        await MarketIncludes.updateOne(
          { marketId: market._id, countryId: india._id },
          { $setOnInsert: { marketId: market._id, countryId: india._id } },
          { upsert: true }
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to add India to default market includes:', (e as Error)?.message);
    }

    // Create default MarketSettings for India market
    try {
      const inr = await mongoose.connection
        .collection('currencies')
        .findOne({ code: 'INR' }, { projection: { _id: 1 } });
      const currencyId = inr?._id || undefined;

      await MarketSettings.updateOne(
        { marketId: market._id },
        {
          $setOnInsert: {
            marketId: market._id,
            storeId,
            currencyId,
            domain: '',
            locale: 'en-IN',
            languageCode: 'en',
            countryCode: 'IN',
            subfolder: '/en-IN',
            isPrimary: true,
            salesTaxCollecting: false,
            dutiesAndImportTaxCollecting: false,
            taxDisplay: 'dynamic',
          },
        },
        { upsert: true }
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create default MarketSettings:', (e as Error)?.message);
    }
  } catch (e) {
    // non-fatal if market creation fails
    // eslint-disable-next-line no-console
    console.warn('Default market creation failed:', (e as Error)?.message);
  }
}


