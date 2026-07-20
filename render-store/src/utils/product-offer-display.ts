/**
 * Client-side hints for product-page offers: dedupe noisy seed data and
 * explain eligibility vs current quantity / line subtotal (single-SKU intent).
 */
import type {
  AmountOffOrderProductOffer,
  AmountOffProductsProductOffer,
  BuyXGetYProductOffer,
  FreeShippingProductOffer,
} from '../contexts/product-offers.context';
import { formatINR } from './currency';

export function dedupeFreeShipping(offers: FreeShippingProductOffer[]): FreeShippingProductOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const k = `${o.minimumPurchase}|${o.minimumAmount ?? ''}|${o.minimumQuantity ?? ''}|${o.discountCode ?? ''}|${o.title ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function dedupeAmountOffOrder(offers: AmountOffOrderProductOffer[]): AmountOffOrderProductOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const k = `${o.valueDescription}|${o.minimumRequirementMessage ?? ''}|${o.minimumPurchase}|${o.minimumQuantity ?? ''}|${o.minimumAmount ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function dedupeAmountOffProducts(offers: AmountOffProductsProductOffer[]): AmountOffProductsProductOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const k = `${o.valueDescription}|${o.minimumRequirementMessage ?? ''}|${o.minimumPurchase}|${o.minimumQuantity ?? ''}|${o.minimumAmount ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function dedupeBuyXGetY(offers: BuyXGetYProductOffer[]): BuyXGetYProductOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const k = `${o.buysRequirementMessage ?? ''}|${o.getsMessage}|${o.customerBuys}|${o.quantity ?? ''}|${o.amount ?? ''}|${o.discountedValue}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function freeShippingMet(offer: FreeShippingProductOffer, lineQty: number, lineSubtotal: number): boolean {
  if (offer.minimumPurchase === 'no-requirements') return true;
  if (offer.minimumPurchase === 'minimum-quantity') {
    const n = offer.minimumQuantity ?? 0;
    return lineQty >= n;
  }
  if (offer.minimumPurchase === 'minimum-amount') {
    const a = offer.minimumAmount ?? 0;
    return lineSubtotal >= a;
  }
  return true;
}

export function freeShippingSecondaryLine(
  offer: FreeShippingProductOffer,
  lineQty: number,
  lineSubtotal: number
): string {
  if (freeShippingMet(offer, lineQty, lineSubtotal)) {
    return offer.minimumPurchase === 'no-requirements'
      ? 'On this order at checkout'
      : offer.minimumRequirementMessage || 'Eligible at checkout with this quantity';
  }
  if (offer.minimumPurchase === 'minimum-quantity' && offer.minimumQuantity != null) {
    const need = offer.minimumQuantity - lineQty;
    return need > 0
      ? `Add ${need} more item(s) in cart (you have ${lineQty})`
      : offer.minimumRequirementMessage || '';
  }
  if (offer.minimumPurchase === 'minimum-amount' && offer.minimumAmount != null) {
    const short = offer.minimumAmount - lineSubtotal;
    return short > 0
      ? `Spend ${formatINR(short)} more on this line for free shipping`
      : offer.minimumRequirementMessage || '';
  }
  return offer.minimumRequirementMessage || 'See details at checkout';
}

function orderMet(offer: AmountOffOrderProductOffer, lineQty: number, lineSubtotal: number): boolean {
  if (offer.minimumPurchase === 'no-requirements') return true;
  if (offer.minimumPurchase === 'minimum-quantity') {
    return lineQty >= (offer.minimumQuantity ?? 0);
  }
  if (offer.minimumPurchase === 'minimum-amount') {
    return lineSubtotal >= (offer.minimumAmount ?? 0);
  }
  return true;
}

export function amountOffOrderSecondaryLine(
  offer: AmountOffOrderProductOffer,
  lineQty: number,
  lineSubtotal: number
): string {
  if (orderMet(offer, lineQty, lineSubtotal)) {
    return offer.minimumRequirementMessage || 'Applies at checkout with this cart';
  }
  if (offer.minimumPurchase === 'minimum-quantity' && offer.minimumQuantity != null) {
    const need = offer.minimumQuantity - lineQty;
    return need > 0
      ? `Add ${need} more item(s) — you have ${lineQty} (order-level offer)`
      : offer.minimumRequirementMessage || '';
  }
  if (offer.minimumPurchase === 'minimum-amount' && offer.minimumAmount != null) {
    const short = offer.minimumAmount - lineSubtotal;
    return short > 0 ? `Spend ${formatINR(short)} more on this line` : offer.minimumRequirementMessage || '';
  }
  return offer.minimumRequirementMessage || 'See checkout';
}

function productOfferMet(offer: AmountOffProductsProductOffer, lineQty: number, lineSubtotal: number): boolean {
  if (offer.minimumPurchase === 'no-requirements') return true;
  if (offer.minimumPurchase === 'minimum-quantity') {
    return lineQty >= (offer.minimumQuantity ?? 0);
  }
  if (offer.minimumPurchase === 'minimum-amount') {
    return lineSubtotal >= (offer.minimumAmount ?? 0);
  }
  return true;
}

export function amountOffProductSecondaryLine(
  offer: AmountOffProductsProductOffer,
  lineQty: number,
  lineSubtotal: number
): string {
  if (productOfferMet(offer, lineQty, lineSubtotal)) {
    return 'On this product at checkout';
  }
  if (offer.minimumPurchase === 'minimum-quantity' && offer.minimumQuantity != null) {
    const need = offer.minimumQuantity - lineQty;
    return need > 0 ? `Need ${offer.minimumQuantity}+ items of this product (have ${lineQty})` : offer.minimumRequirementMessage || '';
  }
  if (offer.minimumPurchase === 'minimum-amount' && offer.minimumAmount != null) {
    const short = offer.minimumAmount - lineSubtotal;
    return short > 0 ? `Spend ${formatINR(short)} more on this product` : offer.minimumRequirementMessage || '';
  }
  return offer.minimumRequirementMessage || 'See checkout';
}

export function buyXGetYSecondaryLine(offer: BuyXGetYProductOffer, lineQty: number, lineSubtotal: number): string {
  let buysMet = false;
  if (offer.customerBuys === 'minimum-quantity' && offer.quantity != null) {
    buysMet = lineQty >= offer.quantity;
  } else if (offer.customerBuys === 'minimum-amount' && offer.amount != null) {
    buysMet = lineSubtotal >= offer.amount;
  } else {
    buysMet = true;
  }

  const base = offer.getsMessage || offer.buysRequirementMessage || 'Buy X Get Y';

  if (buysMet) {
    if (offer.customerGetsAnyItemsFrom === 'specific-collections') {
      return `${base} — choose gift item(s) at checkout when eligible`;
    }
    return `${base} — applied at checkout (free/discounted items added to order)`;
  }

  if (offer.customerBuys === 'minimum-quantity' && offer.quantity != null) {
    const need = offer.quantity - lineQty;
    return need > 0
      ? `Buy ${need} more (need ${offer.quantity}, have ${lineQty}) — ${base}`
      : offer.buysRequirementMessage || base;
  }
  if (offer.customerBuys === 'minimum-amount' && offer.amount != null) {
    const short = offer.amount - lineSubtotal;
    return short > 0
      ? `Spend ${formatINR(short)} more on qualifying items — ${base}`
      : offer.buysRequirementMessage || base;
  }
  return offer.buysRequirementMessage || base;
}
