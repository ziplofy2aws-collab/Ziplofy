export type LiveProductSalesRow = {
  productId: string;
  title: string;
  sales: number;
  units: number;
};

export type LiveCommerceSnapshot = {
  storeId: string;
  orders: number;
  /** Sum of order.subtotal for live-window orders. */
  totalSales: number;
  lastOrderAt: string | null;
  /** Top products by line-item sales in the live window. */
  byProduct: LiveProductSalesRow[];
};

export type LiveOrderLineItemInput = {
  productId: string;
  title: string;
  sales: number;
  units: number;
};

type ProductAgg = {
  productId: string;
  title: string;
  sales: number;
  units: number;
};

type LiveCommerceState = {
  orders: number;
  totalSales: number;
  lastOrderAt: number | null;
  /** productId -> aggregate */
  byProduct: Map<string, ProductAgg>;
};

const TOP_PRODUCTS = 8;

/** In-memory live commerce counters per store (process lifetime). */
const commerceByStore = new Map<string, LiveCommerceState>();

function getOrCreate(storeId: string): LiveCommerceState {
  let state = commerceByStore.get(storeId);
  if (!state) {
    state = {
      orders: 0,
      totalSales: 0,
      lastOrderAt: null,
      byProduct: new Map(),
    };
    commerceByStore.set(storeId, state);
  }
  return state;
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function topProducts(state: LiveCommerceState): LiveProductSalesRow[] {
  return Array.from(state.byProduct.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, TOP_PRODUCTS)
    .map((row) => ({
      productId: row.productId,
      title: row.title,
      sales: roundMoney(row.sales),
      units: row.units,
    }));
}

export function getLiveCommerceSnapshot(storeId: string): LiveCommerceSnapshot {
  const state = getOrCreate(storeId);
  return {
    storeId,
    orders: state.orders,
    totalSales: state.totalSales,
    lastOrderAt: state.lastOrderAt ? new Date(state.lastOrderAt).toISOString() : null,
    byProduct: topProducts(state),
  };
}

/**
 * Record a placed order for Live View. Uses subtotal (gross sales)
 * and optional line items for per-product totals.
 */
export function recordLiveOrder(input: {
  storeId: string;
  salesAmount: number;
  lineItems?: LiveOrderLineItemInput[];
}): LiveCommerceSnapshot {
  const storeId = input.storeId.trim();
  const amount = Number.isFinite(input.salesAmount) ? Math.max(0, input.salesAmount) : 0;
  const state = getOrCreate(storeId);
  state.orders += 1;
  state.totalSales = roundMoney(state.totalSales + amount);
  state.lastOrderAt = Date.now();

  for (const line of input.lineItems ?? []) {
    const productId = typeof line.productId === 'string' ? line.productId.trim() : '';
    if (!productId) continue;
    const sales = Number.isFinite(line.sales) ? Math.max(0, line.sales) : 0;
    const units = Number.isFinite(line.units) ? Math.max(0, Math.floor(line.units)) : 0;
    const title =
      typeof line.title === 'string' && line.title.trim() ? line.title.trim() : 'Product';

    const existing = state.byProduct.get(productId);
    if (existing) {
      existing.sales = roundMoney(existing.sales + sales);
      existing.units += units;
      if (title && title !== 'Product') existing.title = title;
    } else {
      state.byProduct.set(productId, {
        productId,
        title,
        sales: roundMoney(sales),
        units,
      });
    }
  }

  return getLiveCommerceSnapshot(storeId);
}
