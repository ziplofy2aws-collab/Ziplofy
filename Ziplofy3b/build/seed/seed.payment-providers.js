"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPaymentProviders = seedPaymentProviders;
const database_config_1 = require("../config/database.config");
const payment_provider_model_1 = require("../models/payment-provider/payment-provider.model");
const providers = [
    {
        key: 'bogus_gateway',
        name: '(for testing) Bogus Gateway',
        description: 'Simulate transactions for development and testing.',
        category: 'test',
        supports3ds: false,
        paymentMethods: ['bogus'],
        isTest: true,
        sortOrder: 0,
    },
    {
        key: 'razorpay_cards',
        name: 'Cards Onsite by 1Razorpay',
        description: 'Accept card payments on your checkout with Razorpay.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'amex', 'diners', 'rupay'],
        isTest: false,
        sortOrder: 1,
    },
    {
        key: 'cashfree_cards',
        name: 'Cashfree Payments - Cards',
        description: 'Accept domestic and international cards via Cashfree.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'rupay', 'maestro'],
        isTest: false,
        sortOrder: 2,
    },
    {
        key: 'cybersource',
        name: 'Cybersource',
        description: 'Enterprise-grade card processing with global coverage.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: [
            'visa',
            'mastercard',
            'amex',
            'discover',
            'jcb',
            'diners',
            'unionpay',
            'apple_pay',
            'google_pay',
        ],
        isTest: false,
        sortOrder: 3,
    },
    {
        key: 'stripe',
        name: 'Stripe',
        description: 'Accept cards, wallets, and local payment methods worldwide.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'amex', 'discover', 'apple_pay', 'google_pay'],
        isTest: false,
        sortOrder: 4,
    },
    {
        key: 'paypal',
        name: 'PayPal',
        description: 'Let customers pay with their PayPal balance or linked cards.',
        category: 'wallet',
        supports3ds: false,
        paymentMethods: ['paypal'],
        isTest: false,
        sortOrder: 5,
    },
    {
        key: 'phonepe',
        name: 'PhonePe Payment Gateway',
        description: 'Accept UPI, cards, and wallets popular in India.',
        category: 'wallet',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'rupay', 'upi'],
        isTest: false,
        sortOrder: 6,
    },
    {
        key: 'payu',
        name: 'PayU',
        description: 'Cards, net banking, UPI, and wallets for Indian merchants.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'amex', 'rupay', 'netbanking', 'upi'],
        isTest: false,
        sortOrder: 7,
    },
    {
        key: 'ccavenue',
        name: 'CCAvenue',
        description: 'Multi-currency payment gateway for India and global stores.',
        category: 'cards',
        supports3ds: true,
        paymentMethods: ['visa', 'mastercard', 'amex', 'rupay', 'netbanking'],
        isTest: false,
        sortOrder: 8,
    },
    {
        key: 'instamojo',
        name: 'Instamojo',
        description: 'Simple payments for small businesses in India.',
        category: 'wallet',
        supports3ds: false,
        paymentMethods: ['upi', 'netbanking', 'visa', 'mastercard'],
        isTest: false,
        sortOrder: 9,
    },
    {
        key: 'bank_transfer',
        name: 'Bank transfer',
        description: 'Let customers pay by transferring funds directly to your bank account. Orders are placed after checkout and must be approved once payment is received.',
        category: 'bank',
        supports3ds: false,
        paymentMethods: ['bank_transfer'],
        isTest: false,
        sortOrder: 10,
        isManual: true,
    },
    {
        key: 'upi_id',
        name: 'UPI ID',
        description: 'Accept payments via UPI. Customers scan a QR code or pay to your UPI ID at checkout. Orders must be approved once payment is confirmed.',
        category: 'wallet',
        supports3ds: false,
        paymentMethods: ['upi'],
        isTest: false,
        sortOrder: 11,
        isManual: true,
    },
    {
        key: 'cod',
        name: 'Cash on delivery (COD)',
        description: 'Let customers pay in cash when their order is delivered. Activate COD to offer it as a payment option at checkout.',
        category: 'wallet',
        supports3ds: false,
        paymentMethods: ['cod'],
        isTest: false,
        sortOrder: 12,
        isManual: true,
    },
];
async function seedPaymentProviders() {
    try {
        await (0, database_config_1.connectDB)();
        for (const provider of providers) {
            await payment_provider_model_1.PaymentProvider.updateOne({ key: provider.key }, {
                $set: {
                    name: provider.name,
                    description: provider.description,
                    category: provider.category,
                    supports3ds: provider.supports3ds,
                    paymentMethods: provider.paymentMethods,
                    isTest: provider.isTest,
                    isActive: true,
                    isManual: 'isManual' in provider ? provider.isManual : false,
                    sortOrder: provider.sortOrder,
                },
            }, { upsert: true });
        }
        console.log(`✅ Seeded ${providers.length} payment providers.`);
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error seeding payment providers:', err);
        process.exit(1);
    }
}
if (require.main === module) {
    seedPaymentProviders();
}
