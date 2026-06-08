"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_config_1 = require("../config/database.config");
const country_model_1 = require("../models/country/country.model");
const currency_model_1 = require("../models/currency/currency.model");
dotenv_1.default.config();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchWithRetry(url, label, attempts = 4) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Failed to download ${label}: ${res.status} ${res.statusText}`);
            }
            return (await res.json());
        }
        catch (error) {
            lastError = error;
            if (attempt < attempts) {
                const backoffMs = attempt * 1000;
                console.warn(`${label} fetch attempt ${attempt}/${attempts} failed. Retrying in ${backoffMs}ms...`);
                await wait(backoffMs);
            }
        }
    }
    throw lastError instanceof Error ? lastError : new Error(`Failed to download ${label}`);
}
async function fetchAllCountries() {
    const primaryUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,ccn3,region,subregion,flag,currencies';
    try {
        return await fetchWithRetry(primaryUrl, 'countries');
    }
    catch (primaryError) {
        console.warn('Primary countries API failed, using fallback source...');
        const fallbackUrl = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json';
        const fallback = await fetchWithRetry(fallbackUrl, 'countries fallback');
        return fallback
            .filter((c) => Boolean(c.iso2) && Boolean(c.iso3) && Boolean(c.name))
            .map((c) => {
            const currencyCode = (c.currency || '').toUpperCase();
            return {
                name: { common: c.name, official: c.name },
                cca2: c.iso2.toUpperCase(),
                cca3: c.iso3.toUpperCase(),
                ccn3: (c.numeric_code || '').toString(),
                region: c.region || '',
                subregion: c.subregion || '',
                flag: c.emoji || '',
                currencies: currencyCode
                    ? {
                        [currencyCode]: {},
                    }
                    : undefined,
            };
        });
    }
}
async function fetchAllCurrencies() {
    // Returns object like { "USD": "United States Dollar", ... }
    const url = 'https://openexchangerates.org/api/currencies.json';
    return fetchWithRetry(url, 'currencies');
}
async function seedCurrenciesAndCountries() {
    try {
        await (0, database_config_1.connectDB)();
        // 1) Fetch and upsert currencies from standardized API
        const currencyJson = await fetchAllCurrencies();
        const currencyCodes = Object.keys(currencyJson || {}).map((c) => c.toUpperCase());
        if (currencyCodes.length) {
            const currencyOps = currencyCodes.map((code) => {
                const name = currencyJson[code] || code;
                return {
                    updateOne: {
                        filter: { code },
                        update: {
                            $set: {
                                code,
                                name,
                            },
                        },
                        upsert: true,
                    },
                };
            });
            const curRes = await currency_model_1.Currency.bulkWrite(currencyOps, { ordered: false });
            console.log('Currencies seeding completed:', {
                upserted: curRes.upsertedCount,
                modified: curRes.modifiedCount,
                matched: curRes.matchedCount,
            });
        }
        // 2) Build code -> _id map from DB
        const dbCurrencies = await currency_model_1.Currency.find({}, { _id: 1, code: 1 }).lean();
        const currencyMap = new Map();
        for (const cur of dbCurrencies) {
            // @ts-ignore
            currencyMap.set(cur.code, cur._id);
        }
        // 3) Fetch countries and upsert with currency link
        const raw = await fetchAllCountries();
        const ops = raw
            .filter((c) => Boolean(c.cca2) && Boolean(c.cca3) && c.name?.common && c.name?.official)
            .map((c) => {
            const currencyCode = c.currencies ? Object.keys(c.currencies)[0] : undefined;
            const upper = currencyCode ? currencyCode.toUpperCase() : '';
            const currencyId = upper ? currencyMap.get(upper) || null : null;
            return {
                updateOne: {
                    filter: { iso2: c.cca2.toUpperCase() },
                    update: {
                        $set: {
                            name: c.name.common,
                            officialName: c.name.official,
                            iso2: c.cca2.toUpperCase(),
                            iso3: c.cca3.toUpperCase(),
                            numericCode: (c.ccn3 || '').toString(),
                            region: c.region || '',
                            subRegion: c.subregion || '',
                            flagEmoji: c.flag || '',
                            currencyCode: upper,
                            currencyId,
                        },
                    },
                    upsert: true,
                },
            };
        });
        if (ops.length === 0) {
            console.log('No countries to seed.');
            return;
        }
        const result = await country_model_1.Country.bulkWrite(ops, { ordered: false });
        console.log('Countries seeding completed:', {
            upserted: result.upsertedCount,
            modified: result.modifiedCount,
            matched: result.matchedCount,
        });
    }
    catch (err) {
        console.error('Error seeding countries:', err);
        throw err;
    }
    finally {
        // Ensure connection closes cleanly on both success and failure.
        if (mongoose_1.default.connection.readyState !== 0) {
            await mongoose_1.default.disconnect();
            console.log('MongoDB disconnected');
        }
    }
}
seedCurrenciesAndCountries()
    .then(() => {
    process.exitCode = 0;
})
    .catch(() => {
    process.exitCode = 1;
});
