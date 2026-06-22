export const DISCOUNT_LIST_PATH = '/discounts';

export function amountOffProductsDetailsPath(id: string): string {
  return `/discounts/amount-off-products/${id}`;
}

export function buyXGetYDetailsPath(id: string): string {
  return `/discounts/pyxgety/${id}`;
}

export function amountOffOrderDetailsPath(id: string): string {
  return `/discounts/amount-off-order/${id}`;
}

export function freeShippingDetailsPath(id: string): string {
  return `/discounts/free-shipping/${id}`;
}
