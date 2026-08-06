import mongoose from 'mongoose';
import { Country } from '../models/country/country.model';
import { State } from '../models/state/state.model';
import { CountryTax } from '../models/country-tax/country-tax.model';
import { CountryTaxOverride } from '../models/country-tax-override/country-tax-override.model';
import { TaxDefault } from '../models/tax-rate-default/tax-rate-default.model';
import { TaxRateOverride } from '../models/tax-rate-override/tax-rate-override.model';
import { TaxAndDutiesGlobalSettings } from '../models/tax-and-duties-global-settings/tax-and-duties-global-settings.model';

/** India default GST (flat) when DB has no rate configured. */
export const INDIA_DEFAULT_TAX_RATE = 18;

export type ResolvedTaxRate = {
  ratePercent: number;
  label: string;
  calculationMethod: 'added' | 'instead' | 'compounded' | null;
  countryIso2?: string;
  source: 'override' | 'default' | 'country' | 'fallback';
};

export type ComputedOrderTax = {
  tax: number;
  ratePercent: number;
  label: string;
  taxableBase: number;
  taxIncludedInPrice: boolean;
};

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function combineRates(
  federal: number,
  state: number | null,
  method: 'added' | 'instead' | 'compounded' | null | undefined
): number {
  if (state == null || Number.isNaN(state)) return federal;
  if (method === 'instead') return state;
  if (method === 'compounded') return federal + state + (federal * state) / 100;
  if (method === 'added') return federal + state;
  // No method → prefer state if present (India-style regional rate)
  return state > 0 ? state : federal;
}

/**
 * Resolve effective sales tax % for a store + destination country/state.
 * India falls back to 18% GST when no rate is configured.
 */
export async function resolveStoreTaxRate(params: {
  storeId: string | mongoose.Types.ObjectId;
  countryId?: string | mongoose.Types.ObjectId | null;
  countryNameOrIso?: string | null;
  stateNameOrCode?: string | null;
  stateId?: string | mongoose.Types.ObjectId | null;
}): Promise<ResolvedTaxRate> {
  const storeId = new mongoose.Types.ObjectId(String(params.storeId));

  let country =
    params.countryId && mongoose.Types.ObjectId.isValid(String(params.countryId))
      ? await Country.findById(params.countryId).select('name iso2').lean()
      : null;

  if (!country && params.countryNameOrIso?.trim()) {
    const q = params.countryNameOrIso.trim();
    country = await Country.findOne({
      $or: [
        { iso2: q.toUpperCase() },
        { name: new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
    })
      .select('name iso2')
      .lean();
  }

  const isIndia =
    Boolean(country && (country.iso2 === 'IN' || country.name?.toLowerCase() === 'india')) ||
    /^india$/i.test(params.countryNameOrIso || '') ||
    /^in$/i.test(params.countryNameOrIso || '');

  if (!country) {
    return {
      ratePercent: isIndia ? INDIA_DEFAULT_TAX_RATE : 0,
      label: isIndia ? 'GST' : 'Tax',
      calculationMethod: null,
      countryIso2: isIndia ? 'IN' : undefined,
      source: 'fallback',
    };
  }

  const countryId = country._id as mongoose.Types.ObjectId;

  let stateId: mongoose.Types.ObjectId | null =
    params.stateId && mongoose.Types.ObjectId.isValid(String(params.stateId))
      ? new mongoose.Types.ObjectId(String(params.stateId))
      : null;

  if (!stateId && params.stateNameOrCode?.trim()) {
    const s = params.stateNameOrCode.trim();
    const state = await State.findOne({
      countryId,
      $or: [
        { name: new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { code: new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
    })
      .select('_id')
      .lean();
    if (state) stateId = state._id as mongoose.Types.ObjectId;
  }

  const [stateOverride, federalOverride, stateDefault, federalDefault, countryTaxOverride, countryTax] =
    await Promise.all([
      stateId
        ? TaxRateOverride.findOne({ storeId, countryId, stateId }).lean()
        : Promise.resolve(null),
      TaxRateOverride.findOne({ storeId, countryId, stateId: null }).lean(),
      stateId
        ? TaxDefault.findOne({ countryId, stateId }).lean()
        : Promise.resolve(null),
      TaxDefault.findOne({ countryId, stateId: null }).lean(),
      CountryTaxOverride.findOne({ storeId, countryId }).lean(),
      CountryTax.findOne({ countryId }).lean(),
    ]);

  const federalRate =
    federalOverride?.taxRate ??
    federalDefault?.taxRate ??
    countryTaxOverride?.taxRate ??
    countryTax?.taxRate ??
    (isIndia ? INDIA_DEFAULT_TAX_RATE : 0);

  const federalLabel =
    federalOverride?.taxLabel ||
    federalDefault?.taxLabel ||
    (isIndia ? 'GST' : 'Tax');

  if (stateOverride || stateDefault) {
    const stateRate = (stateOverride?.taxRate ?? stateDefault?.taxRate) as number;
    const method = (stateOverride?.calculationMethod ??
      stateDefault?.calculationMethod ??
      null) as ResolvedTaxRate['calculationMethod'];
    const label =
      stateOverride?.taxLabel ||
      stateDefault?.taxLabel ||
      federalLabel;
    const ratePercent = combineRates(Number(federalRate) || 0, Number(stateRate) || 0, method);
    return {
      ratePercent,
      label,
      calculationMethod: method,
      countryIso2: country.iso2,
      source: stateOverride ? 'override' : 'default',
    };
  }

  return {
    ratePercent: Number(federalRate) || (isIndia ? INDIA_DEFAULT_TAX_RATE : 0),
    label: federalLabel,
    calculationMethod: null,
    countryIso2: country.iso2,
    source: federalOverride || countryTaxOverride ? 'override' : countryTax || federalDefault ? 'country' : 'fallback',
  };
}

/** Compute order tax amount from subtotal/shipping using store tax settings. */
export async function computeStoreOrderTax(params: {
  storeId: string | mongoose.Types.ObjectId;
  subtotal: number;
  shippingCost?: number;
  countryId?: string | mongoose.Types.ObjectId | null;
  countryNameOrIso?: string | null;
  stateNameOrCode?: string | null;
  stateId?: string | mongoose.Types.ObjectId | null;
}): Promise<ComputedOrderTax> {
  const [resolved, globalSettings] = await Promise.all([
    resolveStoreTaxRate(params),
    TaxAndDutiesGlobalSettings.findOne({
      storeId: new mongoose.Types.ObjectId(String(params.storeId)),
    }).lean(),
  ]);

  const taxIncludedInPrice = Boolean(globalSettings?.includeSalesTaxInProductPriceAndShippingRate);
  const chargeOnShipping = Boolean(globalSettings?.chargeSalesTaxOnShipping);
  const shipping = Number(params.shippingCost) || 0;
  const subtotal = Number(params.subtotal) || 0;

  if (taxIncludedInPrice || resolved.ratePercent <= 0) {
    return {
      tax: 0,
      ratePercent: resolved.ratePercent,
      label: resolved.label,
      taxableBase: subtotal,
      taxIncludedInPrice,
    };
  }

  const taxableBase = chargeOnShipping ? subtotal + shipping : subtotal;
  const tax = roundMoney((taxableBase * resolved.ratePercent) / 100);

  return {
    tax,
    ratePercent: resolved.ratePercent,
    label: resolved.label,
    taxableBase,
    taxIncludedInPrice,
  };
}
