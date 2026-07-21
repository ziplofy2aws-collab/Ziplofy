/**
 * Exhaustive discount matrix for the demo store (pairs with seed.products-demo).
 * Mirrors create* controllers: main discount document + conditional child collections.
 *
 * Matrices (independent enum cartesian products, with conditional fields filled):
 * - Free shipping: 2×2×2×3×3 = 72 (method × countrySelection × excludeShippingRates × eligibility × minimumPurchase)
 * - Amount off order: 2×2×3×3×2×2×2 = 288 (method × valueType × eligibility × minimumPurchase × productDiscounts × orderDiscounts × shippingDiscounts)
 * - Amount off products: 2×2×2×2×3×3 = 144 (method × valueType × appliesTo × oncePerOrder × eligibility × minimumPurchase)
 * - Buy X Get Y: 2×2×2×2×3×3×2 = 288 (method × customerBuys × anyItemsFrom × customerGetsAnyItemsFrom × discountedValue × eligibility × setMaxUsersPerOrder)
 *
 * Prerequisites: seed.products-demo run; seed:countries (for FS selected-countries); store exists.
 * Creates if missing: demo collection (all seed-demo products), CustomerSegment + Customer for targeted eligibility rows.
 *
 * Cleanup: removes prior seed discounts matching SEED-DEMO-* codes / "Seed demo *" titles for this store.
 *
 *   npm run build && npm run seed:discounts-demo
 *   SEED_STORE_ID=... npm run seed:discounts-demo
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';
import { Store } from '../models/store/store.model';
import { Product } from '../models/product/product.model';
import { Collections } from '../models/collections/collections.model';
import { CollectionEntry } from '../models/collection-entry/collection-entry.model';
import { Country } from '../models/country/country.model';
import { CustomerSegment } from '../models/customer-segment/customer-segment.model';
import { Customer } from '../models/customer/customer.model';

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

const DEFAULT_STORE_ID = '69c0e15f1e7974f7c551af66';
const DEMO_PRODUCT_HANDLE_PREFIX = 'seed-demo-';
const DEMO_COLLECTION_HANDLE = 'seed-demo-all-products';

type StoreId = mongoose.Types.ObjectId;

let codeCounter = 0;
function nextCode(prefix: string): string {
  codeCounter += 1;
  return `${prefix}-${codeCounter}`;
}

async function wipeFreeShipping(storeId: StoreId) {
  const rows = await FreeShippingDiscount.find({
    storeId,
    $or: [{ discountCode: /^SEED-DEMO-FS-/ }, { title: /^Seed demo FS /i }],
  }).select('_id');
  const ids = rows.map((r) => r._id);
  if (ids.length === 0) return;
  await FreeShippingCountryEntry.deleteMany({ discountId: { $in: ids } });
  await FreeShippingCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
  await FreeShippingCustomerEntry.deleteMany({ discountId: { $in: ids } });
  await FreeShippingDiscountUsage.deleteMany({ discountId: { $in: ids } });
  await FreeShippingDiscount.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} seeded free-shipping discount(s).`);
}

async function wipeAmountOffOrder(storeId: StoreId) {
  const rows = await AmountOffOrderDiscount.find({
    storeId,
    $or: [{ discountCode: /^SEED-DEMO-AOO-/ }, { title: /^Seed demo AOO /i }],
  }).select('_id');
  const ids = rows.map((r) => r._id);
  if (ids.length === 0) return;
  await AmountOffOrderCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
  await AmountOffOrderCustomerEntry.deleteMany({ discountId: { $in: ids } });
  await AmountOffOrderDiscountUsage.deleteMany({ discountId: { $in: ids } });
  await AmountOffOrderDiscount.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} seeded amount-off-order discount(s).`);
}

async function wipeAmountOffProducts(storeId: StoreId) {
  const rows = await AmountOffProductsDiscount.find({
    storeId,
    $or: [{ discountCode: /^SEED-DEMO-AOP-/ }, { title: /^Seed demo AOP /i }],
  }).select('_id');
  const ids = rows.map((r) => r._id);
  if (ids.length === 0) return;
  await AmountOffProductsEntry.deleteMany({ discountId: { $in: ids } });
  await AmountOffProductsCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
  await AmountOffProductsCustomerEntry.deleteMany({ discountId: { $in: ids } });
  await AmountOffProductsDiscountUsage.deleteMany({ discountId: { $in: ids } });
  await AmountOffProductsDiscount.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} seeded amount-off-products discount(s).`);
}

async function wipeBuyXGetY(storeId: StoreId) {
  const rows = await BuyXGetYDiscount.find({
    storeId,
    $or: [{ discountCode: /^SEED-DEMO-BXGY-/ }, { title: /^Seed demo BXGY /i }],
  }).select('_id');
  const ids = rows.map((r) => r._id);
  if (ids.length === 0) return;
  await BuyXGetYBuysProductEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYBuysCollectionEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYGetsProductEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYGetsCollectionEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYCustomerEntry.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYDiscountUsage.deleteMany({ discountId: { $in: ids } });
  await BuyXGetYDiscount.deleteMany({ _id: { $in: ids } });
  console.log(`Removed ${ids.length} seeded Buy-X-Get-Y discount(s).`);
}

async function ensureDemoContext(storeId: StoreId) {
  const store = await Store.findById(storeId);
  if (!store) throw new Error(`Store not found: ${storeId.toHexString()}`);

  const products = await Product.find({
    storeId,
    urlHandle: new RegExp(`^${DEMO_PRODUCT_HANDLE_PREFIX}`),
  }).sort({ urlHandle: 1 });
  if (products.length === 0) {
    throw new Error('No demo products found (urlHandle seed-demo-*). Run npm run seed:products-demo first.');
  }

  const countries = await Country.find().limit(3).select('_id');
  if (countries.length === 0) {
    throw new Error('No countries in DB. Run npm run seed:countries before selected-countries free-shipping rows.');
  }

  let collection = await Collections.findOne({ storeId, urlHandle: DEMO_COLLECTION_HANDLE });
  if (!collection) {
    collection = await Collections.create({
      storeId,
      title: 'Seed Demo All Products',
      description: 'Synthetic collection linking all seed-demo-* products for discount matrix tests.',
      pageTitle: 'Seed Demo All Products',
      metaDescription: 'Demo collection for amount-off and BXGY discount seeding.',
      urlHandle: DEMO_COLLECTION_HANDLE,
      onlineStorePublishing: true,
      pointOfSalePublishing: false,
      status: 'published',
    });
    await CollectionEntry.insertMany(
      products.map((p) => ({ collectionId: collection!._id, productId: p._id }))
    );
    console.log('Created demo collection + entries for all seed products.');
  }

  let segment = await CustomerSegment.findOne({ storeId, name: 'Seed Demo Segment' });
  if (!segment) {
    segment = await CustomerSegment.create({ storeId, name: 'Seed Demo Segment' });
    console.log('Created CustomerSegment "Seed Demo Segment".');
  }

  const demoEmail = `seed-demo-discounts-${storeId.toHexString()}@example.com`;
  let customer = await Customer.findOne({ email: demoEmail });
  if (!customer) {
    customer = await Customer.create({
      storeId,
      firstName: 'Seed',
      lastName: 'DemoBuyer',
      language: 'en',
      email: demoEmail,
      agreedToMarketingEmails: false,
      agreedToSmsMarketing: false,
      collectTax: 'collect',
      tagIds: [],
    });
    console.log('Created demo Customer for targeted eligibility rows.');
  }

  return {
    products,
    collectionId: collection._id,
    countryIds: countries.map((c) => c._id),
    segmentId: segment._id,
    customerId: customer._id,
    productIdA: products[0]._id,
    productIdB: products.length > 1 ? products[1]._id : products[0]._id,
    productIdC: products.length > 2 ? products[2]._id : products[0]._id,
  };
}

async function attachFsEligibility(
  storeId: StoreId,
  discountId: mongoose.Types.ObjectId,
  eligibility: string,
  segmentId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) {
  if (eligibility === 'specific-customer-segments') {
    await FreeShippingCustomerSegmentEntry.create({
      storeId,
      discountId,
      customerSegmentId: segmentId,
    });
  } else if (eligibility === 'specific-customers') {
    await FreeShippingCustomerEntry.create({ storeId, discountId, customerId });
  }
}

async function attachAooEligibility(
  storeId: StoreId,
  discountId: mongoose.Types.ObjectId,
  eligibility: string,
  segmentId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) {
  if (eligibility === 'specific-customer-segments') {
    await AmountOffOrderCustomerSegmentEntry.create({
      storeId,
      discountId,
      customerSegmentId: segmentId,
    });
  } else if (eligibility === 'specific-customers') {
    await AmountOffOrderCustomerEntry.create({ storeId, discountId, customerId });
  }
}

async function attachAopEligibility(
  storeId: StoreId,
  discountId: mongoose.Types.ObjectId,
  eligibility: string,
  segmentId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) {
  if (eligibility === 'specific-customer-segments') {
    await AmountOffProductsCustomerSegmentEntry.create({
      storeId,
      discountId,
      customerSegmentId: segmentId,
    });
  } else if (eligibility === 'specific-customers') {
    await AmountOffProductsCustomerEntry.create({ storeId, discountId, customerId });
  }
}

async function attachBxgyEligibility(
  storeId: StoreId,
  discountId: mongoose.Types.ObjectId,
  eligibility: string,
  segmentId: mongoose.Types.ObjectId,
  customerId: mongoose.Types.ObjectId
) {
  if (eligibility === 'specific-customer-segments') {
    await BuyXGetYCustomerSegmentEntry.create({
      storeId,
      discountId,
      customerSegmentId: segmentId,
    });
  } else if (eligibility === 'specific-customers') {
    await BuyXGetYCustomerEntry.create({ storeId, discountId, customerId });
  }
}

async function seedFreeShippingMatrix(
  storeId: StoreId,
  ctx: Awaited<ReturnType<typeof ensureDemoContext>>,
  fsIndex: { i: number }
) {
  const methods = ['discount-code', 'automatic'] as const;
  const countrySelections = ['all-countries', 'selected-countries'] as const;
  const excludes = [false, true] as const;
  const eligibilities = [
    'all-customers',
    'specific-customer-segments',
    'specific-customers',
  ] as const;
  const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'] as const;

  for (const method of methods) {
    for (const countrySelection of countrySelections) {
      for (const excludeShippingRates of excludes) {
        for (const eligibility of eligibilities) {
          for (const minimumPurchase of minimumPurchases) {
            fsIndex.i += 1;
            const code = nextCode('SEED-DEMO-FS');
            const discount = await FreeShippingDiscount.create({
              storeId,
              method,
              ...(method === 'discount-code' ? { discountCode: code } : {}),
              ...(method === 'automatic'
                ? { title: `Seed demo FS auto #${fsIndex.i}` }
                : {}),
              countrySelection,
              excludeShippingRates,
              shippingRateLimit: excludeShippingRates ? 25 : undefined,
              eligibility,
              applyOnPOSPro: method === 'automatic' && eligibility === 'all-customers',
              minimumPurchase,
              minimumAmount: minimumPurchase === 'minimum-amount' ? 50 : undefined,
              minimumQuantity: minimumPurchase === 'minimum-quantity' ? 2 : undefined,
              allowDiscountOnChannels: method === 'discount-code',
              limitTotalUses: method === 'discount-code',
              totalUsesLimit: method === 'discount-code' ? 500 : undefined,
              limitOneUsePerCustomer: false,
              productDiscounts: false,
              orderDiscounts: false,
              startDate: '2020-01-01',
              startTime: '00:00',
              setEndDate: false,
              status: 'active',
            });

            await attachFsEligibility(storeId, discount._id, eligibility, ctx.segmentId, ctx.customerId);

            if (countrySelection === 'selected-countries') {
              await FreeShippingCountryEntry.insertMany(
                ctx.countryIds.map((countryId) => ({
                  storeId,
                  discountId: discount._id,
                  countryId,
                }))
              );
            }
          }
        }
      }
    }
  }
}

async function seedAmountOffOrderMatrix(
  storeId: StoreId,
  ctx: Awaited<ReturnType<typeof ensureDemoContext>>,
  idx: { i: number }
) {
  const methods = ['discount-code', 'automatic'] as const;
  const valueTypes = ['percentage', 'fixed-amount'] as const;
  const eligibilities = [
    'all-customers',
    'specific-customer-segments',
    'specific-customers',
  ] as const;
  const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'] as const;
  const bools = [false, true] as const;

  for (const method of methods) {
    for (const valueType of valueTypes) {
      for (const eligibility of eligibilities) {
        for (const minimumPurchase of minimumPurchases) {
          for (const productDiscounts of bools) {
            for (const orderDiscounts of bools) {
              for (const shippingDiscounts of bools) {
                idx.i += 1;
                const code = nextCode('SEED-DEMO-AOO');
                const discount = await AmountOffOrderDiscount.create({
                  storeId,
                  method,
                  ...(method === 'discount-code' ? { discountCode: code } : {}),
                  ...(method === 'automatic'
                    ? { title: `Seed demo AOO auto #${idx.i}` }
                    : {}),
                  valueType,
                  ...(valueType === 'percentage' ? { percentage: 12 } : { fixedAmount: 7.5 }),
                  eligibility,
                  applyOnPOSPro: method === 'automatic' && eligibility === 'all-customers',
                  minimumPurchase,
                  minimumAmount: minimumPurchase === 'minimum-amount' ? 40 : undefined,
                  minimumQuantity: minimumPurchase === 'minimum-quantity' ? 3 : undefined,
                  productDiscounts,
                  orderDiscounts,
                  shippingDiscounts,
                  allowDiscountOnChannels: method === 'discount-code',
                  limitTotalUses: method === 'discount-code',
                  totalUsesLimit: method === 'discount-code' ? 300 : undefined,
                  limitOneUsePerCustomer: false,
                  startDate: '2020-01-01',
                  startTime: '00:00',
                  setEndDate: false,
                  status: 'active',
                });

                await attachAooEligibility(storeId, discount._id, eligibility, ctx.segmentId, ctx.customerId);
              }
            }
          }
        }
      }
    }
  }
}

async function seedAmountOffProductsMatrix(
  storeId: StoreId,
  ctx: Awaited<ReturnType<typeof ensureDemoContext>>,
  idx: { i: number }
) {
  const methods = ['discount-code', 'automatic'] as const;
  const valueTypes = ['percentage', 'fixed-amount'] as const;
  const appliesTos = ['specific-products', 'specific-collections'] as const;
  const onceFlags = [false, true] as const;
  const eligibilities = [
    'all-customers',
    'specific-customer-segments',
    'specific-customers',
  ] as const;
  const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'] as const;

  for (const method of methods) {
    for (const valueType of valueTypes) {
      for (const appliesTo of appliesTos) {
        for (const oncePerOrder of onceFlags) {
          for (const eligibility of eligibilities) {
            for (const minimumPurchase of minimumPurchases) {
              idx.i += 1;
              const code = nextCode('SEED-DEMO-AOP');
              const discount = await AmountOffProductsDiscount.create({
                storeId,
                method,
                ...(method === 'discount-code' ? { discountCode: code } : {}),
                ...(method === 'automatic'
                  ? { title: `Seed demo AOP auto #${idx.i}` }
                  : {}),
                allowDiscountOnChannels: method === 'discount-code',
                limitTotalUses: method === 'discount-code',
                totalUsesLimit: method === 'discount-code' ? 400 : undefined,
                limitOneUsePerCustomer: false,
                valueType,
                ...(valueType === 'percentage' ? { percentage: 15 } : { fixedAmount: 5 }),
                appliesTo,
                oncePerOrder,
                eligibility,
                applyOnPOSPro: method === 'automatic' && eligibility === 'all-customers',
                minimumPurchase,
                minimumAmount: minimumPurchase === 'minimum-amount' ? 35 : undefined,
                minimumQuantity: minimumPurchase === 'minimum-quantity' ? 2 : undefined,
                productDiscounts: false,
                orderDiscounts: false,
                shippingDiscounts: false,
                startDate: '2020-01-01',
                startTime: '00:00',
                setEndDate: false,
                status: 'active',
              });

              if (appliesTo === 'specific-products') {
                await AmountOffProductsEntry.insertMany([
                  { storeId, discountId: discount._id, productId: ctx.productIdA, collectionId: null },
                  { storeId, discountId: discount._id, productId: ctx.productIdB, collectionId: null },
                ]);
              } else {
                await AmountOffProductsEntry.create({
                  storeId,
                  discountId: discount._id,
                  productId: null,
                  collectionId: ctx.collectionId,
                });
              }

              await attachAopEligibility(storeId, discount._id, eligibility, ctx.segmentId, ctx.customerId);
            }
          }
        }
      }
    }
  }
}

async function seedBuyXGetYMatrix(
  storeId: StoreId,
  ctx: Awaited<ReturnType<typeof ensureDemoContext>>,
  idx: { i: number }
) {
  const methods = ['discount-code', 'automatic'] as const;
  const customerBuysOpts = ['minimum-quantity', 'minimum-amount'] as const;
  const anyFrom = ['specific-products', 'specific-collections'] as const;
  const getsFrom = ['specific-products', 'specific-collections'] as const;
  const discountedValues = ['free', 'amount', 'percentage'] as const;
  const eligibilities = [
    'all-customers',
    'specific-customer-segments',
    'specific-customers',
  ] as const;
  const setMaxOpts = [false, true] as const;

  for (const method of methods) {
    for (const customerBuys of customerBuysOpts) {
      for (const anyItemsFrom of anyFrom) {
        for (const customerGetsAnyItemsFrom of getsFrom) {
          for (const discountedValue of discountedValues) {
            for (const eligibility of eligibilities) {
              for (const setMaxUsersPerOrder of setMaxOpts) {
                idx.i += 1;
                const code = nextCode('SEED-DEMO-BXGY');
                const discount = await BuyXGetYDiscount.create({
                  storeId,
                  method,
                  ...(method === 'discount-code' ? { discountCode: code } : {}),
                  ...(method === 'automatic'
                    ? { title: `Seed demo BXGY auto #${idx.i}` }
                    : {}),
                  allowDiscountOnChannels: method === 'discount-code',
                  customerBuys,
                  quantity: customerBuys === 'minimum-quantity' ? 2 : undefined,
                  amount: customerBuys === 'minimum-amount' ? 30 : undefined,
                  anyItemsFrom,
                  customerGetsQuantity: 1,
                  customerGetsAnyItemsFrom,
                  discountedValue,
                  discountedAmount: discountedValue === 'amount' ? 5 : undefined,
                  discountedPercentage: discountedValue === 'percentage' ? 20 : undefined,
                  setMaxUsersPerOrder,
                  maxUsersPerOrder: setMaxUsersPerOrder ? 3 : undefined,
                  eligibility,
                  applyOnPOSPro: method === 'automatic' && eligibility === 'all-customers',
                  limitTotalUses: method === 'discount-code',
                  totalUsesLimit: method === 'discount-code' ? 250 : undefined,
                  limitOneUsePerCustomer: false,
                  productDiscounts: false,
                  orderDiscounts: false,
                  shippingDiscounts: false,
                  startDate: '2020-01-01',
                  startTime: '00:00',
                  setEndDate: false,
                  status: 'active',
                });

                if (anyItemsFrom === 'specific-products') {
                  await BuyXGetYBuysProductEntry.create({
                    storeId,
                    discountId: discount._id,
                    productId: ctx.productIdA,
                  });
                } else {
                  await BuyXGetYBuysCollectionEntry.create({
                    storeId,
                    discountId: discount._id,
                    collectionId: ctx.collectionId,
                  });
                }

                if (customerGetsAnyItemsFrom === 'specific-products') {
                  await BuyXGetYGetsProductEntry.create({
                    storeId,
                    discountId: discount._id,
                    productId: ctx.productIdC,
                    discountedValue,
                    ...(discountedValue === 'amount' ? { discountedAmount: 5 } : {}),
                    ...(discountedValue === 'percentage' ? { discountedPercentage: 20 } : {}),
                    setMaxUsesPerOrder: setMaxUsersPerOrder,
                    ...(setMaxUsersPerOrder ? { maxUsesPerOrder: 3 } : {}),
                  });
                } else {
                  await BuyXGetYGetsCollectionEntry.create({
                    storeId,
                    discountId: discount._id,
                    collectionId: ctx.collectionId,
                    discountedValue,
                    ...(discountedValue === 'amount' ? { discountedAmount: 5 } : {}),
                    ...(discountedValue === 'percentage' ? { discountedPercentage: 20 } : {}),
                    setMaxUsesPerOrder: setMaxUsersPerOrder,
                    ...(setMaxUsersPerOrder ? { maxUsesPerOrder: 3 } : {}),
                  });
                }

                await attachBxgyEligibility(storeId, discount._id, eligibility, ctx.segmentId, ctx.customerId);
              }
            }
          }
        }
      }
    }
  }
}

async function resolveStoreId(): Promise<mongoose.Types.ObjectId | null> {
  const envStoreId = process.env.SEED_STORE_ID;
  if (envStoreId) {
    if (!mongoose.Types.ObjectId.isValid(envStoreId)) {
      throw new Error(`Invalid SEED_STORE_ID: ${envStoreId}`);
    }
    const found = await Store.findById(envStoreId).select('_id').lean();
    if (!found?._id) {
      throw new Error(`SEED_STORE_ID not found: ${envStoreId}`);
    }
    return new mongoose.Types.ObjectId(String(found._id));
  }

  if (mongoose.Types.ObjectId.isValid(DEFAULT_STORE_ID)) {
    const foundDefault = await Store.findById(DEFAULT_STORE_ID).select('_id').lean();
    if (foundDefault?._id) {
      return new mongoose.Types.ObjectId(String(foundDefault._id));
    }
  }

  const firstStore = await Store.findOne().sort({ createdAt: 1 }).select('_id').lean();
  if (!firstStore?._id) {
    return null;
  }
  return new mongoose.Types.ObjectId(String(firstStore._id));
}

async function main() {
  await connectDB();
  const storeId = await resolveStoreId();
  if (!storeId) {
    console.log(
      'No store found. Skipping demo discount seed. Create a store first or set SEED_STORE_ID.'
    );
    process.exit(0);
  }

  codeCounter = 0;

  await wipeFreeShipping(storeId);
  await wipeAmountOffOrder(storeId);
  await wipeAmountOffProducts(storeId);
  await wipeBuyXGetY(storeId);

  const ctx = await ensureDemoContext(storeId);

  const fsIdx = { i: 0 };
  const aooIdx = { i: 0 };
  const aopIdx = { i: 0 };
  const bxgyIdx = { i: 0 };

  console.log('Seeding free-shipping matrix (72)…');
  await seedFreeShippingMatrix(storeId, ctx, fsIdx);

  console.log('Seeding amount-off-order matrix (288)…');
  await seedAmountOffOrderMatrix(storeId, ctx, aooIdx);

  console.log('Seeding amount-off-products matrix (144)…');
  await seedAmountOffProductsMatrix(storeId, ctx, aopIdx);

  console.log('Seeding Buy-X-Get-Y matrix (288)…');
  await seedBuyXGetYMatrix(storeId, ctx, bxgyIdx);

  const total = fsIdx.i + aooIdx.i + aopIdx.i + bxgyIdx.i;
  console.log(
    `Discount matrix seeded: FS=${fsIdx.i}, AOO=${aooIdx.i}, AOP=${aopIdx.i}, BXGY=${bxgyIdx.i}, total=${total}.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
