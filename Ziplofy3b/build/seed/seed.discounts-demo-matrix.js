"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_config_1 = require("../config/database.config");
const store_model_1 = require("../models/store/store.model");
const product_model_1 = require("../models/product/product.model");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const country_model_1 = require("../models/country/country.model");
const customer_segment_model_1 = require("../models/customer-segment/customer-segment.model");
const customer_model_1 = require("../models/customer/customer.model");
const free_shipping_discount_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-discount.model");
const free_shipping_country_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-country-entry.model");
const free_shipping_customer_segment_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-customer-segment-entry.model");
const free_shipping_customer_entry_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-customer-entry.model");
const free_shipping_discount_usage_model_1 = require("../models/discount/free-shipping-discount-model/free-shipping-discount-usage.model");
const amount_off_order_discount_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-discount.model");
const amount_off_order_customer_segment_entry_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-customer-segment-entry.model");
const amount_off_order_customer_entry_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-customer-entry.model");
const amount_off_order_discount_usage_model_1 = require("../models/discount/amount-off-order-discount-model/amount-off-order-discount-usage.model");
const amount_off_products_discount_model_1 = require("../models/discount/amount-off-product-discount-model/amount-off-products-discount.model");
const amount_off_products_entry_model_1 = require("../models/discount/amount-off-product-discount-model/amount-off-products-entry.model");
const amount_off_products_customer_segment_entry_model_1 = require("../models/discount/amount-off-product-discount-model/amount-off-products-customer-segment-entry.model");
const amount_off_products_customer_entry_model_1 = require("../models/discount/amount-off-product-discount-model/amount-off-products-customer-entry.model");
const amount_off_products_discount_usage_model_1 = require("../models/discount/amount-off-product-discount-model/amount-off-products-discount-usage.model");
const buy_x_get_y_discount_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount.model");
const buy_x_get_y_buys_product_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-product-entry.model");
const buy_x_get_y_buys_collection_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-buys-collection-entry.model");
const buy_x_get_y_gets_product_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-product-entry.model");
const buy_x_get_y_gets_collection_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-gets-collection-entry.model");
const buy_x_get_y_customer_segment_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-segment-entry.model");
const buy_x_get_y_customer_entry_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-customer-entry.model");
const buy_x_get_y_discount_usage_model_1 = require("../models/discount/buy-x-get-y-discount-model/buy-x-get-y-discount-usage.model");
dotenv_1.default.config();
const DEFAULT_STORE_ID = '69c0e15f1e7974f7c551af66';
const DEMO_PRODUCT_HANDLE_PREFIX = 'seed-demo-';
const DEMO_COLLECTION_HANDLE = 'seed-demo-all-products';
let codeCounter = 0;
function nextCode(prefix) {
    codeCounter += 1;
    return `${prefix}-${codeCounter}`;
}
async function wipeFreeShipping(storeId) {
    const rows = await free_shipping_discount_model_1.FreeShippingDiscount.find({
        storeId,
        $or: [{ discountCode: /^SEED-DEMO-FS-/ }, { title: /^Seed demo FS /i }],
    }).select('_id');
    const ids = rows.map((r) => r._id);
    if (ids.length === 0)
        return;
    await free_shipping_country_entry_model_1.FreeShippingCountryEntry.deleteMany({ discountId: { $in: ids } });
    await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
    await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.deleteMany({ discountId: { $in: ids } });
    await free_shipping_discount_usage_model_1.FreeShippingDiscountUsage.deleteMany({ discountId: { $in: ids } });
    await free_shipping_discount_model_1.FreeShippingDiscount.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} seeded free-shipping discount(s).`);
}
async function wipeAmountOffOrder(storeId) {
    const rows = await amount_off_order_discount_model_1.AmountOffOrderDiscount.find({
        storeId,
        $or: [{ discountCode: /^SEED-DEMO-AOO-/ }, { title: /^Seed demo AOO /i }],
    }).select('_id');
    const ids = rows.map((r) => r._id);
    if (ids.length === 0)
        return;
    await amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
    await amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.deleteMany({ discountId: { $in: ids } });
    await amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage.deleteMany({ discountId: { $in: ids } });
    await amount_off_order_discount_model_1.AmountOffOrderDiscount.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} seeded amount-off-order discount(s).`);
}
async function wipeAmountOffProducts(storeId) {
    const rows = await amount_off_products_discount_model_1.AmountOffProductsDiscount.find({
        storeId,
        $or: [{ discountCode: /^SEED-DEMO-AOP-/ }, { title: /^Seed demo AOP /i }],
    }).select('_id');
    const ids = rows.map((r) => r._id);
    if (ids.length === 0)
        return;
    await amount_off_products_entry_model_1.AmountOffProductsEntry.deleteMany({ discountId: { $in: ids } });
    await amount_off_products_customer_segment_entry_model_1.AmountOffProductsCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
    await amount_off_products_customer_entry_model_1.AmountOffProductsCustomerEntry.deleteMany({ discountId: { $in: ids } });
    await amount_off_products_discount_usage_model_1.AmountOffProductsDiscountUsage.deleteMany({ discountId: { $in: ids } });
    await amount_off_products_discount_model_1.AmountOffProductsDiscount.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} seeded amount-off-products discount(s).`);
}
async function wipeBuyXGetY(storeId) {
    const rows = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.find({
        storeId,
        $or: [{ discountCode: /^SEED-DEMO-BXGY-/ }, { title: /^Seed demo BXGY /i }],
    }).select('_id');
    const ids = rows.map((r) => r._id);
    if (ids.length === 0)
        return;
    await buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage.deleteMany({ discountId: { $in: ids } });
    await buy_x_get_y_discount_model_1.BuyXGetYDiscount.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} seeded Buy-X-Get-Y discount(s).`);
}
async function ensureDemoContext(storeId) {
    const store = await store_model_1.Store.findById(storeId);
    if (!store)
        throw new Error(`Store not found: ${storeId.toHexString()}`);
    const products = await product_model_1.Product.find({
        storeId,
        urlHandle: new RegExp(`^${DEMO_PRODUCT_HANDLE_PREFIX}`),
    }).sort({ urlHandle: 1 });
    if (products.length === 0) {
        throw new Error('No demo products found (urlHandle seed-demo-*). Run npm run seed:products-demo first.');
    }
    const countries = await country_model_1.Country.find().limit(3).select('_id');
    if (countries.length === 0) {
        throw new Error('No countries in DB. Run npm run seed:countries before selected-countries free-shipping rows.');
    }
    let collection = await collections_model_1.Collections.findOne({ storeId, urlHandle: DEMO_COLLECTION_HANDLE });
    if (!collection) {
        collection = await collections_model_1.Collections.create({
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
        await collection_entry_model_1.CollectionEntry.insertMany(products.map((p) => ({ collectionId: collection._id, productId: p._id })));
        console.log('Created demo collection + entries for all seed products.');
    }
    let segment = await customer_segment_model_1.CustomerSegment.findOne({ storeId, name: 'Seed Demo Segment' });
    if (!segment) {
        segment = await customer_segment_model_1.CustomerSegment.create({ storeId, name: 'Seed Demo Segment' });
        console.log('Created CustomerSegment "Seed Demo Segment".');
    }
    const demoEmail = `seed-demo-discounts-${storeId.toHexString()}@example.com`;
    let customer = await customer_model_1.Customer.findOne({ email: demoEmail });
    if (!customer) {
        customer = await customer_model_1.Customer.create({
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
async function attachFsEligibility(storeId, discountId, eligibility, segmentId, customerId) {
    if (eligibility === 'specific-customer-segments') {
        await free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry.create({
            storeId,
            discountId,
            customerSegmentId: segmentId,
        });
    }
    else if (eligibility === 'specific-customers') {
        await free_shipping_customer_entry_model_1.FreeShippingCustomerEntry.create({ storeId, discountId, customerId });
    }
}
async function attachAooEligibility(storeId, discountId, eligibility, segmentId, customerId) {
    if (eligibility === 'specific-customer-segments') {
        await amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry.create({
            storeId,
            discountId,
            customerSegmentId: segmentId,
        });
    }
    else if (eligibility === 'specific-customers') {
        await amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry.create({ storeId, discountId, customerId });
    }
}
async function attachAopEligibility(storeId, discountId, eligibility, segmentId, customerId) {
    if (eligibility === 'specific-customer-segments') {
        await amount_off_products_customer_segment_entry_model_1.AmountOffProductsCustomerSegmentEntry.create({
            storeId,
            discountId,
            customerSegmentId: segmentId,
        });
    }
    else if (eligibility === 'specific-customers') {
        await amount_off_products_customer_entry_model_1.AmountOffProductsCustomerEntry.create({ storeId, discountId, customerId });
    }
}
async function attachBxgyEligibility(storeId, discountId, eligibility, segmentId, customerId) {
    if (eligibility === 'specific-customer-segments') {
        await buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry.create({
            storeId,
            discountId,
            customerSegmentId: segmentId,
        });
    }
    else if (eligibility === 'specific-customers') {
        await buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry.create({ storeId, discountId, customerId });
    }
}
async function seedFreeShippingMatrix(storeId, ctx, fsIndex) {
    const methods = ['discount-code', 'automatic'];
    const countrySelections = ['all-countries', 'selected-countries'];
    const excludes = [false, true];
    const eligibilities = [
        'all-customers',
        'specific-customer-segments',
        'specific-customers',
    ];
    const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'];
    for (const method of methods) {
        for (const countrySelection of countrySelections) {
            for (const excludeShippingRates of excludes) {
                for (const eligibility of eligibilities) {
                    for (const minimumPurchase of minimumPurchases) {
                        fsIndex.i += 1;
                        const code = nextCode('SEED-DEMO-FS');
                        const discount = await free_shipping_discount_model_1.FreeShippingDiscount.create({
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
                            await free_shipping_country_entry_model_1.FreeShippingCountryEntry.insertMany(ctx.countryIds.map((countryId) => ({
                                storeId,
                                discountId: discount._id,
                                countryId,
                            })));
                        }
                    }
                }
            }
        }
    }
}
async function seedAmountOffOrderMatrix(storeId, ctx, idx) {
    const methods = ['discount-code', 'automatic'];
    const valueTypes = ['percentage', 'fixed-amount'];
    const eligibilities = [
        'all-customers',
        'specific-customer-segments',
        'specific-customers',
    ];
    const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'];
    const bools = [false, true];
    for (const method of methods) {
        for (const valueType of valueTypes) {
            for (const eligibility of eligibilities) {
                for (const minimumPurchase of minimumPurchases) {
                    for (const productDiscounts of bools) {
                        for (const orderDiscounts of bools) {
                            for (const shippingDiscounts of bools) {
                                idx.i += 1;
                                const code = nextCode('SEED-DEMO-AOO');
                                const discount = await amount_off_order_discount_model_1.AmountOffOrderDiscount.create({
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
async function seedAmountOffProductsMatrix(storeId, ctx, idx) {
    const methods = ['discount-code', 'automatic'];
    const valueTypes = ['percentage', 'fixed-amount'];
    const appliesTos = ['specific-products', 'specific-collections'];
    const onceFlags = [false, true];
    const eligibilities = [
        'all-customers',
        'specific-customer-segments',
        'specific-customers',
    ];
    const minimumPurchases = ['no-requirements', 'minimum-amount', 'minimum-quantity'];
    for (const method of methods) {
        for (const valueType of valueTypes) {
            for (const appliesTo of appliesTos) {
                for (const oncePerOrder of onceFlags) {
                    for (const eligibility of eligibilities) {
                        for (const minimumPurchase of minimumPurchases) {
                            idx.i += 1;
                            const code = nextCode('SEED-DEMO-AOP');
                            const discount = await amount_off_products_discount_model_1.AmountOffProductsDiscount.create({
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
                                await amount_off_products_entry_model_1.AmountOffProductsEntry.insertMany([
                                    { storeId, discountId: discount._id, productId: ctx.productIdA, collectionId: null },
                                    { storeId, discountId: discount._id, productId: ctx.productIdB, collectionId: null },
                                ]);
                            }
                            else {
                                await amount_off_products_entry_model_1.AmountOffProductsEntry.create({
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
async function seedBuyXGetYMatrix(storeId, ctx, idx) {
    const methods = ['discount-code', 'automatic'];
    const customerBuysOpts = ['minimum-quantity', 'minimum-amount'];
    const anyFrom = ['specific-products', 'specific-collections'];
    const getsFrom = ['specific-products', 'specific-collections'];
    const discountedValues = ['free', 'amount', 'percentage'];
    const eligibilities = [
        'all-customers',
        'specific-customer-segments',
        'specific-customers',
    ];
    const setMaxOpts = [false, true];
    for (const method of methods) {
        for (const customerBuys of customerBuysOpts) {
            for (const anyItemsFrom of anyFrom) {
                for (const customerGetsAnyItemsFrom of getsFrom) {
                    for (const discountedValue of discountedValues) {
                        for (const eligibility of eligibilities) {
                            for (const setMaxUsersPerOrder of setMaxOpts) {
                                idx.i += 1;
                                const code = nextCode('SEED-DEMO-BXGY');
                                const discount = await buy_x_get_y_discount_model_1.BuyXGetYDiscount.create({
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
                                    await buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry.create({
                                        storeId,
                                        discountId: discount._id,
                                        productId: ctx.productIdA,
                                    });
                                }
                                else {
                                    await buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry.create({
                                        storeId,
                                        discountId: discount._id,
                                        collectionId: ctx.collectionId,
                                    });
                                }
                                if (customerGetsAnyItemsFrom === 'specific-products') {
                                    await buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry.create({
                                        storeId,
                                        discountId: discount._id,
                                        productId: ctx.productIdC,
                                        discountedValue,
                                        ...(discountedValue === 'amount' ? { discountedAmount: 5 } : {}),
                                        ...(discountedValue === 'percentage' ? { discountedPercentage: 20 } : {}),
                                        setMaxUsesPerOrder: setMaxUsersPerOrder,
                                        ...(setMaxUsersPerOrder ? { maxUsesPerOrder: 3 } : {}),
                                    });
                                }
                                else {
                                    await buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry.create({
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
async function resolveStoreId() {
    const envStoreId = process.env.SEED_STORE_ID;
    if (envStoreId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(envStoreId)) {
            throw new Error(`Invalid SEED_STORE_ID: ${envStoreId}`);
        }
        const found = await store_model_1.Store.findById(envStoreId).select('_id').lean();
        if (!found?._id) {
            throw new Error(`SEED_STORE_ID not found: ${envStoreId}`);
        }
        return new mongoose_1.default.Types.ObjectId(String(found._id));
    }
    if (mongoose_1.default.Types.ObjectId.isValid(DEFAULT_STORE_ID)) {
        const foundDefault = await store_model_1.Store.findById(DEFAULT_STORE_ID).select('_id').lean();
        if (foundDefault?._id) {
            return new mongoose_1.default.Types.ObjectId(String(foundDefault._id));
        }
    }
    const firstStore = await store_model_1.Store.findOne().sort({ createdAt: 1 }).select('_id').lean();
    if (!firstStore?._id) {
        return null;
    }
    return new mongoose_1.default.Types.ObjectId(String(firstStore._id));
}
async function main() {
    await (0, database_config_1.connectDB)();
    const storeId = await resolveStoreId();
    if (!storeId) {
        console.log('No store found. Skipping demo discount seed. Create a store first or set SEED_STORE_ID.');
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
    console.log(`Discount matrix seeded: FS=${fsIdx.i}, AOO=${aooIdx.i}, AOP=${aopIdx.i}, BXGY=${bxgyIdx.i}, total=${total}.`);
    process.exit(0);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
