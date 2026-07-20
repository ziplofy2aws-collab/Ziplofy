import mongoose from 'mongoose';
import { GeneralSettings } from '../models/general-settings.model';
import { NotificationSettings } from '../models/notification-settings.model';
import { StoreSubdomain } from '../models/store-subdomain';
import { LocationModel } from '../models/location.model';
import { IStore, Store } from '../models/store';
import { IUser } from '../models/user';
import { createDefaultMarket } from './market.utils';

/**
 * Creates default resources for a newly registered user (store, settings, market, subdomain).
 * Used by both email/password register and Google sign-up flows.
 */
export const createDefaultResourcesForNewUser = async (user: IUser): Promise<void> => {
  const store = await createDefaultStore(user);
  const displayName = user.name || user.email?.split('@')[0] || 'store';

  await GeneralSettings.create({
    storeId: store._id,
    storeName: store.storeName,
    storeEmail: user.email,
  });

  await NotificationSettings.create({
    storeId: store._id,
    senderEmail: user.email,
  });

  await createDefaultMarket(store._id);

  const slugBase = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  const subdomain = `${slugBase}-${suffix}`;
  await StoreSubdomain.create({ storeId: store._id, subdomain });
};

/**
 * Creates a default store for a new user
 * @param user - The user object for whom to create the store
 * @returns Promise<IStore> - The created store
 */
export const createDefaultStore = async (user: IUser): Promise<IStore> => {
  const displayName = user.name || user.email?.split('@')[0] || 'User';
  const defaultStore = await Store.create({
    userId: user._id,
    storeName: `${displayName}'s Store`,
    storeDescription: `Welcome to ${displayName}'s store! This is your default store where you can start selling your products.`
  });

  // Create a default location for this store
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

  // Save default location reference on store
  defaultStore.defaultLocation = defaultLocation._id as mongoose.Types.ObjectId;
  await defaultStore.save();

  console.log(`Default store created for user ${user.email}: ${defaultStore.storeName}`);
  return defaultStore;
};
