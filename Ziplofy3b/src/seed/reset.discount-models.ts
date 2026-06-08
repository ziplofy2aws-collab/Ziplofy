/**
 * Deletes all documents from every discount-related MongoDB collection (full reset).
 * Does not modify orders, carts, or products — only discount definitions + usage/eligibility rows.
 *
 * Usage (from Ziplofy3b):
 *   npm run reset-discount-model
 *
 * Ensure MONGODB_URI / MONGO_URI is set (e.g. via .env.development).
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';

import { FreeShippingDiscount } from '../models/discount/free-shipping-discount-model/free-shipping-discount.model';
import { FreeShippingCountryEntry } from '../models/discount/free-shipping-discount-model/free-shipping-country-entry.model';
import { FreeShippingCustomerSegmentEntry } from '../models/discount/free-shipping-discount-model/free-shipping-customer-segment-entry.model';
import { FreeShippingCustomerEntry } from '../models/discount/free-shipping-discount-model/free-shipping-customer-entry.model';
import { FreeShippingDiscountUsage } from '../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model';

import { AmountOffOrderDiscount } from '../models/discount/amount-off-order-discount-model/amount-off-order-discount.model';
import { AmountOffOrderCustomerSegmentEntry } from '../models/discount/amount-off-order-discount-model/amount-off-order-customer-segment-entry.model';
import { AmountOffOrderCustomerEntry } from '../models/discount/amount-off-order-discount-model/amount-off-order-customer-entry.model';
import { AmountOffOrderDiscountUsage } from '../models/discount/amount-off-order-discount-model/amount-off-order-discount-usage.model';

import { AmountOffProductsDiscount } from '../models/discount/amount-off-product-discount-model/amount-off-products-discount.model';
import { AmountOffProductsEntry } from '../models/discount/amount-off-product-discount-model/amount-off-products-entry.model';
import { AmountOffProductsCustomerSegmentEntry } from '../models/discount/amount-off-product-discount-model/amount-off-products-customer-segment-entry.model';
import { AmountOffProductsCustomerEntry } from '../models/discount/amount-off-product-discount-model/amount-off-products-customer-entry.model';
import { AmountOffProductsDiscountUsage } from '../models/discount/amount-off-product-discount-model/amount-off-products-discount-usage.model';

import { BuyXGetYDiscount } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model';
import { BuyXGetYBuysProductEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model';
import { BuyXGetYBuysCollectionEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model';
import { BuyXGetYGetsProductEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model';
import { BuyXGetYGetsCollectionEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model';
import { BuyXGetYCustomerSegmentEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model';
import { BuyXGetYCustomerEntry } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model';
import { BuyXGetYDiscountUsage } from '../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model';

dotenv.config();

async function wipe(model: mongoose.Model<any>, label: string): Promise<void> {
  const res = await model.deleteMany({});
  console.log(`  ${label}: ${res.deletedCount} document(s) removed`);
}

async function main(): Promise<void> {
  console.log('Connecting to MongoDB…');
  await connectDB();

  console.log('Removing discount-related collections (children first, then parent discounts)…\n');

  // Amount off products
  await wipe(AmountOffProductsDiscountUsage, 'AmountOffProductsDiscountUsage');
  await wipe(AmountOffProductsCustomerEntry, 'AmountOffProductsCustomerEntry');
  await wipe(AmountOffProductsCustomerSegmentEntry, 'AmountOffProductsCustomerSegmentEntry');
  await wipe(AmountOffProductsEntry, 'AmountOffProductsEntry');
  await wipe(AmountOffProductsDiscount, 'AmountOffProductsDiscount');

  // Amount off order
  await wipe(AmountOffOrderDiscountUsage, 'AmountOffOrderDiscountUsage');
  await wipe(AmountOffOrderCustomerEntry, 'AmountOffOrderCustomerEntry');
  await wipe(AmountOffOrderCustomerSegmentEntry, 'AmountOffOrderCustomerSegmentEntry');
  await wipe(AmountOffOrderDiscount, 'AmountOffOrderDiscount');

  // Free shipping
  await wipe(FreeShippingDiscountUsage, 'FreeShippingDiscountUsage');
  await wipe(FreeShippingCustomerEntry, 'FreeShippingCustomerEntry');
  await wipe(FreeShippingCustomerSegmentEntry, 'FreeShippingCustomerSegmentEntry');
  await wipe(FreeShippingCountryEntry, 'FreeShippingCountryEntry');
  await wipe(FreeShippingDiscount, 'FreeShippingDiscount');

  // Buy X Get Y
  await wipe(BuyXGetYDiscountUsage, 'BuyXGetYDiscountUsage');
  await wipe(BuyXGetYCustomerEntry, 'BuyXGetYCustomerEntry');
  await wipe(BuyXGetYCustomerSegmentEntry, 'BuyXGetYCustomerSegmentEntry');
  await wipe(BuyXGetYGetsProductEntry, 'BuyXGetYGetsProductEntry');
  await wipe(BuyXGetYGetsCollectionEntry, 'BuyXGetYGetsCollectionEntry');
  await wipe(BuyXGetYBuysCollectionEntry, 'BuyXGetYBuysCollectionEntry');
  await wipe(BuyXGetYBuysProductEntry, 'BuyXGetYBuysProductEntry');
  await wipe(BuyXGetYDiscount, 'BuyXGetYDiscount');

  console.log('\nDone. All discount models cleared.');
  console.log('Note: existing orders may still store old discount IDs in history; recreate discounts or re-seed as needed.');
}

main()
  .then(() => mongoose.connection.close())
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    mongoose.connection.close().finally(() => process.exit(1));
  });
