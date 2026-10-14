import mongoose from 'mongoose';
import { GeneralSettings } from '../models/general-settings/general-settings.model';
import { LocationModel } from '../models/location/location.model';
import { Market } from '../models/market/market.model';
import { MarketIncludes } from '../models/market-includes/market-includes.model';
import { MarketSettings } from '../models/market-settings/market-settings.model';
import { NotificationSettings } from '../models/notification-settings/notification-settings.model';
import { Store } from '../models/store/store.model';
import { Subdomain } from '../models/subdomain.model';
import type { ICodiicUser } from '../models/codiic-user.model';
import { assignDefaultCatalogThemeToStore } from './assign-default-catalog-theme.util';
import { assignDefaultPackagingToStore } from './assign-default-packaging.util';

type NewUser = Pick<ICodiicUser, '_id' | 'name' | 'email'>;

export type StoreBootstrapOptions = {
  storeName?: string;
  industry?: string;
  industryKind?: 'ecommerce' | 'service' | '';
};

function padDescription(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length >= 10) return trimmed.slice(0, 500);
  return `${trimmed} online store.`.slice(0, 500);
}


/**
 * Creates the default India market (+ includes and settings) for a newly created store.
 * Merged in from the former `server` service. Each step is defensive so a partial failure
 * never blocks user registration.
 */
async function createDefaultMarket(storeId: mongoose.Types.ObjectId): Promise<void> {
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
      console.warn('Failed to add India to default market includes:', (e as Error)?.message);
    }

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
      console.warn('Failed to create default MarketSettings:', (e as Error)?.message);
    }
  } catch (e) {
    console.warn('Default market creation failed:', (e as Error)?.message);
  }
}

/**
 * Creates a default store (and its default location) for a new user.
 */
async function createDefaultStore(
  user: NewUser,
  options?: StoreBootstrapOptions
): Promise<{ storeId: mongoose.Types.ObjectId; storeName: string }> {
  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const storeName = (options?.storeName || `${displayName}'s Store`).trim().slice(0, 100);
  const defaultStore = await Store.create({
    userId: user._id,
    storeName,
    storeDescription: padDescription(`Welcome to ${storeName}! This is your store.`),
    industry: options?.industry || '',
    industryKind: options?.industryKind || '',
  });

  const defaultLocation = await LocationModel.create({
    storeId: defaultStore._id,
    name: 'Default Location',
    countryRegion: 'United States',
    address: '123 Default Street',
    apartment: '',
    city: 'Default City',
    state: 'CA',
    postalCode: '00000',
    phone: '+1-000-000-0000',
    canShip: true,
    canLocalDeliver: false,
    canPickup: true,
    isDefault: true,
    isFulfillmentAllowed: true,
    isActive: true,
  });

  defaultStore.defaultLocation = defaultLocation._id as mongoose.Types.ObjectId;
  await defaultStore.save();

  console.log(`Default store created for user ${user.email}: ${defaultStore.storeName}`);
  return { storeId: defaultStore._id, storeName };
}

/**
 * Creates default resources for a newly registered user (store, settings, market, subdomain).
 * Used by both the email/password register and Google sign-up flows.
 */
export const createDefaultResourcesForNewUser = async (
  user: NewUser,
  options?: StoreBootstrapOptions
): Promise<{ storeId: mongoose.Types.ObjectId; subdomain: string }> => {
  const { storeId, storeName } = await createDefaultStore(user, options);
  const slugSource = storeName || user.name || user.email?.split('@')[0] || 'store';

  await GeneralSettings.create({
    storeId,
    storeName,
    storeEmail: user.email,
  });

  await NotificationSettings.create({
    storeId,
    senderEmail: user.email,
  });

  await createDefaultMarket(storeId);

  try {
    await assignDefaultCatalogThemeToStore(storeId);
  } catch (e) {
    console.warn('Failed to assign default catalog theme for new user store:', (e as Error)?.message);
  }

  try {
    await assignDefaultPackagingToStore(storeId);
  } catch (e) {
    console.warn('Failed to create default packaging for new user store:', (e as Error)?.message);
  }

  const slugBase = slugSource
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'store';
  const suffix = Math.random().toString(36).slice(2, 6);
  const subdomain = `${slugBase}-${suffix}`;
  await Subdomain.create({ storeId, subdomain });
  return { storeId, subdomain };
};
