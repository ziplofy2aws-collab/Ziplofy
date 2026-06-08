"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Deletes all documents from every discount-related MongoDB collection (full reset).
 * Does not modify orders, carts, or products — only discount definitions + usage/eligibility rows.
 *
 * Usage (from Ziplofy3b):
 *   npm run reset-discount-model
 *
 * Ensure MONGODB_URI / MONGO_URI is set (e.g. via .env.development).
 */
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_config_1 = require("../config/database.config");
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
async function wipe(model, label) {
    const res = await model.deleteMany({});
    console.log(`  ${label}: ${res.deletedCount} document(s) removed`);
}
async function main() {
    console.log('Connecting to MongoDB…');
    await (0, database_config_1.connectDB)();
    console.log('Removing discount-related collections (children first, then parent discounts)…\n');
    // Amount off products
    await wipe(amount_off_products_discount_usage_model_1.AmountOffProductsDiscountUsage, 'AmountOffProductsDiscountUsage');
    await wipe(amount_off_products_customer_entry_model_1.AmountOffProductsCustomerEntry, 'AmountOffProductsCustomerEntry');
    await wipe(amount_off_products_customer_segment_entry_model_1.AmountOffProductsCustomerSegmentEntry, 'AmountOffProductsCustomerSegmentEntry');
    await wipe(amount_off_products_entry_model_1.AmountOffProductsEntry, 'AmountOffProductsEntry');
    await wipe(amount_off_products_discount_model_1.AmountOffProductsDiscount, 'AmountOffProductsDiscount');
    // Amount off order
    await wipe(amount_off_order_discount_usage_model_1.AmountOffOrderDiscountUsage, 'AmountOffOrderDiscountUsage');
    await wipe(amount_off_order_customer_entry_model_1.AmountOffOrderCustomerEntry, 'AmountOffOrderCustomerEntry');
    await wipe(amount_off_order_customer_segment_entry_model_1.AmountOffOrderCustomerSegmentEntry, 'AmountOffOrderCustomerSegmentEntry');
    await wipe(amount_off_order_discount_model_1.AmountOffOrderDiscount, 'AmountOffOrderDiscount');
    // Free shipping
    await wipe(free_shipping_discount_usage_model_1.FreeShippingDiscountUsage, 'FreeShippingDiscountUsage');
    await wipe(free_shipping_customer_entry_model_1.FreeShippingCustomerEntry, 'FreeShippingCustomerEntry');
    await wipe(free_shipping_customer_segment_entry_model_1.FreeShippingCustomerSegmentEntry, 'FreeShippingCustomerSegmentEntry');
    await wipe(free_shipping_country_entry_model_1.FreeShippingCountryEntry, 'FreeShippingCountryEntry');
    await wipe(free_shipping_discount_model_1.FreeShippingDiscount, 'FreeShippingDiscount');
    // Buy X Get Y
    await wipe(buy_x_get_y_discount_usage_model_1.BuyXGetYDiscountUsage, 'BuyXGetYDiscountUsage');
    await wipe(buy_x_get_y_customer_entry_model_1.BuyXGetYCustomerEntry, 'BuyXGetYCustomerEntry');
    await wipe(buy_x_get_y_customer_segment_entry_model_1.BuyXGetYCustomerSegmentEntry, 'BuyXGetYCustomerSegmentEntry');
    await wipe(buy_x_get_y_gets_product_entry_model_1.BuyXGetYGetsProductEntry, 'BuyXGetYGetsProductEntry');
    await wipe(buy_x_get_y_gets_collection_entry_model_1.BuyXGetYGetsCollectionEntry, 'BuyXGetYGetsCollectionEntry');
    await wipe(buy_x_get_y_buys_collection_entry_model_1.BuyXGetYBuysCollectionEntry, 'BuyXGetYBuysCollectionEntry');
    await wipe(buy_x_get_y_buys_product_entry_model_1.BuyXGetYBuysProductEntry, 'BuyXGetYBuysProductEntry');
    await wipe(buy_x_get_y_discount_model_1.BuyXGetYDiscount, 'BuyXGetYDiscount');
    console.log('\nDone. All discount models cleared.');
    console.log('Note: existing orders may still store old discount IDs in history; recreate discounts or re-seed as needed.');
}
main()
    .then(() => mongoose_1.default.connection.close())
    .then(() => {
    console.log('Connection closed.');
    process.exit(0);
})
    .catch((err) => {
    console.error(err);
    mongoose_1.default.connection.close().finally(() => process.exit(1));
});
