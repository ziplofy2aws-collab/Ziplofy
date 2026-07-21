import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';
import { Country } from '../models/country/country.model';
import { Currency } from '../models/currency/currency.model';

dotenv.config();

type RestCountry = {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  ccn3?: string;
  region?: string;
  subregion?: string;
  flag?: string;
  currencies?: Record<string, { name?: string; symbol?: string }>;
};

type FallbackCountry = {
  name: string;
  iso2: string;
  iso3: string;
  numeric_code?: string;
  region?: string;
  subregion?: string;
  emoji?: string;
  currency?: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry<T>(url: string, label: string, attempts = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to download ${label}: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    } catch (error) {
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

async function fetchAllCountries(): Promise<RestCountry[]> {
  const primaryUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,ccn3,region,subregion,flag,currencies';
  try {
    return await fetchWithRetry<RestCountry[]>(primaryUrl, 'countries');
  } catch (primaryError) {
    console.warn('Primary countries API failed, using fallback source...');
    const fallbackUrl =
      'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json';
    const fallback = await fetchWithRetry<FallbackCountry[]>(fallbackUrl, 'countries fallback');

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
        } as RestCountry;
      });
  }
}

async function fetchAllCurrencies(): Promise<Record<string, string>> {
  // Returns object like { "USD": "United States Dollar", ... }
  const url = 'https://openexchangerates.org/api/currencies.json';
  return fetchWithRetry<Record<string, string>>(url, 'currencies');
}

async function seedCurrenciesAndCountries() {
  try {
    await connectDB();

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
      const curRes = await Currency.bulkWrite(currencyOps as any, { ordered: false });
      console.log('Currencies seeding completed:', {
        upserted: curRes.upsertedCount,
        modified: curRes.modifiedCount,
        matched: curRes.matchedCount,
      });
    }

    // 2) Build code -> _id map from DB
    const dbCurrencies = await Currency.find({}, { _id: 1, code: 1 }).lean();
    const currencyMap = new Map<string, mongoose.Types.ObjectId>();
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

    const result = await Country.bulkWrite(ops as any, { ordered: false });
    console.log('Countries seeding completed:', {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (err) {
    console.error('Error seeding countries:', err);
    throw err;
  } finally {
    // Ensure connection closes cleanly on both success and failure.
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
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


