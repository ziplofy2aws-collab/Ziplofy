import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { CompareMode } from '../components/analytics/AnalyticsDateRangePicker';

export type AnalyticsSummary = {
  orders: number;
  ordersFulfilled: number;
  grossSales: number;
};

export type AnalyticsSalesPoint = {
  t: string;
  label: string;
  sales: number;
};

export type AnalyticsSalesOverTime = {
  totalGrossSales: number;
  bucket: 'hour' | 'day' | 'month';
  timezone: string;
  points: AnalyticsSalesPoint[];
};

export type AnalyticsAovPoint = {
  t: string;
  label: string;
  aov: number;
};

export type AnalyticsAovOverTime = {
  averageOrderValue: number;
  orders: number;
  totalGrossSales: number;
  bucket: 'hour' | 'day' | 'month';
  timezone: string;
  points: AnalyticsAovPoint[];
};

export type AnalyticsProductSalesRow = {
  productId: string;
  title: string;
  imageUrl: string | null;
  sales: number;
  units: number;
};

export type AnalyticsSalesByProduct = {
  totalSales: number;
  products: AnalyticsProductSalesRow[];
};

export type AnalyticsSalesBreakdown = {
  grossSales: number;
  discounts: number;
  salesReversals: number;
  netSales: number;
  shippingCharges: number;
  returnFees: number;
  taxes: number;
  totalSales: number;
};

export type AnalyticsRateStat = {
  rate: number;
  numerator: number;
  denominator: number;
};

export type AnalyticsOrderHealth = {
  unpaid: number;
  unpaidAmount: number;
  unfulfilled: number;
  unfulfilledAmount: number;
};

export type AnalyticsSparklineSeries = {
  grossSales: number[];
  orders: number[];
  ordersFulfilled: number[];
  returningRate: number[];
};

export type AnalyticsLocationSalesRow = {
  name: string;
  path: string;
  sales: number;
  orders: number;
};

export type AnalyticsPaymentMethodRow = {
  key: string;
  name: string;
  sales: number;
  orders: number;
};

export type AnalyticsSellThroughRow = {
  productId: string;
  title: string;
  unitsSold: number;
  onHand: number;
  rate: number;
};

export type AnalyticsTopCustomerRow = {
  customerId: string;
  name: string;
  email: string;
  sales: number;
  orders: number;
};

export type AnalyticsInventoryRiskRow = {
  variantId: string;
  title: string;
  sku: string;
  available: number;
  status: 'sold_out' | 'low';
};

export type AnalyticsRecentOrderRow = {
  orderId: string;
  displayOrderId: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
};

export type AnalyticsInsights = {
  salesBreakdown: AnalyticsSalesBreakdown;
  returningCustomerRate: AnalyticsRateStat;
  repeatPurchaseRate: AnalyticsRateStat;
  orderHealth: AnalyticsOrderHealth;
  sparkline: AnalyticsSparklineSeries;
  salesByLocation: AnalyticsLocationSalesRow[];
  salesByPaymentMethod: AnalyticsPaymentMethodRow[];
  sellThrough: AnalyticsSellThroughRow[];
  topCustomers: AnalyticsTopCustomerRow[];
  inventoryRisk: AnalyticsInventoryRiskRow[];
  recentOrders: AnalyticsRecentOrderRow[];
};

export type AnalyticsCountRate = {
  count: number;
  total: number;
  rate: number;
};

export type AnalyticsDayStat = {
  averageDays: number;
  medianDays: number;
  sample: number;
};

export type AnalyticsNamedCount = {
  key: string;
  name: string;
  value: number;
};

export type AnalyticsNamedMoney = {
  key: string;
  name: string;
  sales: number;
  orders: number;
  aov: number;
};

export type AnalyticsLtvBucket = {
  key: string;
  label: string;
  customers: number;
  sales: number;
};

export type AnalyticsSegmentRow = {
  segmentId: string;
  name: string;
  customers: number;
  gmv: number;
  orders: number;
};

export type AnalyticsSkuRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  sales: number;
  units: number;
  velocity: number;
};

export type AnalyticsCollectionRow = {
  collectionId: string;
  name: string;
  sales: number;
  units: number;
  orders: number;
  products: number;
};

export type AnalyticsProductInsights = {
  daySpan: number;
  topSkus: AnalyticsSkuRow[];
  topOptions: AnalyticsNamedCount[];
  salesByVendor: AnalyticsNamedMoney[];
  salesByType: AnalyticsNamedMoney[];
  salesByCategory: AnalyticsNamedMoney[];
  salesByTag: AnalyticsNamedMoney[];
  collections: AnalyticsCollectionRow[];
  margin: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    marginRate: number;
    units: number;
    unitsMissingCost: number;
  };
  digitalMix: {
    physicalSales: number;
    physicalUnits: number;
    digitalSales: number;
    digitalUnits: number;
    digitalRate: number;
  };
  catalog: {
    active: number;
    draft: number;
    total: number;
    activeRate: number;
  };
  markdown: {
    catalogOnSale: number;
    catalogTotal: number;
    catalogRate: number;
    soldOnSaleUnits: number;
    soldUnits: number;
    soldOnSaleRate: number;
  };
};

export type AnalyticsInventoryQtyRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  onHand: number;
  available: number;
  committed: number;
  incoming: number;
  unavailable: number;
  value: number;
};

export type AnalyticsInventoryLocationRow = {
  locationId: string;
  name: string;
  onHand: number;
  available: number;
  committed: number;
  incoming: number;
  unavailable: number;
  value: number;
};

export type AnalyticsCoverRow = {
  variantId: string;
  sku: string;
  title: string;
  options: string;
  onHand: number;
  units: number;
  velocity: number;
  daysOfCover: number;
};

export type AnalyticsInventoryInsights = {
  daySpan: number;
  totals: {
    onHand: number;
    available: number;
    committed: number;
    incoming: number;
    unavailable: number;
    value: number;
    skusMissingCost: number;
    daysOfCover: number;
  };
  unavailableBreakdown: {
    damaged: number;
    qualityControl: number;
    safetyStock: number;
    other: number;
  };
  bySku: AnalyticsInventoryQtyRow[];
  byLocation: AnalyticsInventoryLocationRow[];
  committedBySku: AnalyticsInventoryQtyRow[];
  coverRisk: AnalyticsCoverRow[];
};

export type AnalyticsContentRecentRow = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
};

export type AnalyticsContentArticleRow = {
  articleId: string;
  title: string;
  comments: number;
};

export type AnalyticsContentInsights = {
  newsletter: {
    signups: number;
    unsubscribes: number;
    netList: number;
    unsubRate: number;
    subscribeRate: number;
    storeSubscribed: number;
    storeUnsubscribed: number;
    storeTotal: number;
    listMix: AnalyticsNamedCount[];
    movementMix: AnalyticsNamedCount[];
  };
  contactForm: {
    volume: number;
    unread: number;
    spam: number;
    read: number;
    spamRate: number;
    readRate: number;
    unreadRate: number;
    withPhone: number;
    withoutPhone: number;
    storeUnread: number;
    storeRead: number;
    storeSpam: number;
    storeTotal: number;
    statusMix: AnalyticsNamedCount[];
    storeStatusMix: AnalyticsNamedCount[];
    phoneMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
  blogPosts: {
    blogs: number;
    published: number;
    created: number;
    hidden: number;
    publishRate: number;
    visibleRate: number;
    storeVisible: number;
    storeHidden: number;
    storeTotal: number;
    withFeaturedImage: number;
    withoutFeaturedImage: number;
    withExcerpt: number;
    withoutExcerpt: number;
    withTags: number;
    withoutTags: number;
    byAuthor: AnalyticsNamedCount[];
    byTag: AnalyticsNamedCount[];
    visibilityMix: AnalyticsNamedCount[];
    rangeVisibilityMix: AnalyticsNamedCount[];
    commentModeMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
  blogComments: {
    total: number;
    pending: number;
    published: number;
    spam: number;
    pendingRate: number;
    publishRate: number;
    spamRate: number;
    storePending: number;
    storePublished: number;
    storeSpam: number;
    storeTotal: number;
    statusMix: AnalyticsNamedCount[];
    storeStatusMix: AnalyticsNamedCount[];
    topArticles: AnalyticsContentArticleRow[];
  };
  pages: {
    published: number;
    created: number;
    hidden: number;
    publishRate: number;
    visibleRate: number;
    storeVisible: number;
    storeHidden: number;
    storeTotal: number;
    withSeoTitle: number;
    withoutSeoTitle: number;
    withMetaDescription: number;
    withoutMetaDescription: number;
    withContent: number;
    withoutContent: number;
    themeMix: AnalyticsNamedCount[];
    visibilityMix: AnalyticsNamedCount[];
    rangeVisibilityMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
};

export type AnalyticsCustomerInsights = {
  newCustomers: number;
  purchasedVsNeverBought: {
    purchased: number;
    neverBought: number;
    signups: number;
    storePurchased: number;
    storeNeverBought: number;
    storeCustomers: number;
  };
  newVsReturningBuyers: {
    newBuyers: number;
    returningBuyers: number;
    totalBuyers: number;
  };
  ltvDistribution: AnalyticsLtvBucket[];
  ordersPerCustomer: {
    average: number;
    median: number;
    buyers: number;
    allCustomersAverage: number;
  };
  timeToFirstPurchase: AnalyticsDayStat;
  recency: AnalyticsDayStat & { buckets: AnalyticsNamedCount[] };
  purchaseFrequency: AnalyticsDayStat;
  emailOptIn: AnalyticsCountRate;
  smsOptIn: AnalyticsCountRate;
  customersByTag: AnalyticsNamedCount[];
  segments: AnalyticsSegmentRow[];
  languageMix: AnalyticsNamedCount[];
  aovByCountry: AnalyticsNamedMoney[];
  aovByState: AnalyticsNamedMoney[];
  aovByCity: AnalyticsNamedMoney[];
  salesByPin: AnalyticsNamedMoney[];
};

export type AnalyticsDateRange = {
  from: Date;
  to: Date;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type AnalyticsContextType = {
  summary: AnalyticsSummary;
  compareSummary: AnalyticsSummary | null;
  salesOverTime: AnalyticsSalesOverTime;
  compareSalesOverTime: AnalyticsSalesOverTime | null;
  aovOverTime: AnalyticsAovOverTime;
  compareAovOverTime: AnalyticsAovOverTime | null;
  salesByProduct: AnalyticsSalesByProduct;
  insights: AnalyticsInsights;
  compareInsights: AnalyticsInsights | null;
  customerInsights: AnalyticsCustomerInsights;
  compareCustomerInsights: AnalyticsCustomerInsights | null;
  contentInsights: AnalyticsContentInsights;
  compareContentInsights: AnalyticsContentInsights | null;
  productInsights: AnalyticsProductInsights;
  compareProductInsights: AnalyticsProductInsights | null;
  inventoryInsights: AnalyticsInventoryInsights;
  compareInventoryInsights: AnalyticsInventoryInsights | null;
  range: AnalyticsDateRange | null;
  compareRange: AnalyticsDateRange | null;
  compareMode: CompareMode;
  loading: boolean;
  error: string | null;
  setRange: (range: AnalyticsDateRange) => void;
  setCompare: (payload: { mode: CompareMode; range: AnalyticsDateRange | null }) => void;
  fetchSummary: (storeId: string, range?: AnalyticsDateRange) => Promise<void>;
  fetchCustomerInsights: (storeId: string, range?: AnalyticsDateRange) => Promise<void>;
  fetchContentInsights: (storeId: string, range?: AnalyticsDateRange) => Promise<void>;
  fetchProductInsights: (storeId: string, range?: AnalyticsDateRange) => Promise<void>;
  fetchInventoryInsights: (storeId: string, range?: AnalyticsDateRange) => Promise<void>;
};

const EMPTY_SUMMARY: AnalyticsSummary = {
  orders: 0,
  ordersFulfilled: 0,
  grossSales: 0,
};

const EMPTY_SALES_OVER_TIME: AnalyticsSalesOverTime = {
  totalGrossSales: 0,
  bucket: 'hour',
  timezone: 'Asia/Kolkata',
  points: [],
};

const EMPTY_AOV_OVER_TIME: AnalyticsAovOverTime = {
  averageOrderValue: 0,
  orders: 0,
  totalGrossSales: 0,
  bucket: 'hour',
  timezone: 'Asia/Kolkata',
  points: [],
};

const EMPTY_SALES_BY_PRODUCT: AnalyticsSalesByProduct = {
  totalSales: 0,
  products: [],
};

const EMPTY_INSIGHTS: AnalyticsInsights = {
  salesBreakdown: {
    grossSales: 0,
    discounts: 0,
    salesReversals: 0,
    netSales: 0,
    shippingCharges: 0,
    returnFees: 0,
    taxes: 0,
    totalSales: 0,
  },
  returningCustomerRate: { rate: 0, numerator: 0, denominator: 0 },
  repeatPurchaseRate: { rate: 0, numerator: 0, denominator: 0 },
  orderHealth: { unpaid: 0, unpaidAmount: 0, unfulfilled: 0, unfulfilledAmount: 0 },
  sparkline: { grossSales: [], orders: [], ordersFulfilled: [], returningRate: [] },
  salesByLocation: [],
  salesByPaymentMethod: [],
  sellThrough: [],
  topCustomers: [],
  inventoryRisk: [],
  recentOrders: [],
};

const EMPTY_CUSTOMER_INSIGHTS: AnalyticsCustomerInsights = {
  newCustomers: 0,
  purchasedVsNeverBought: {
    purchased: 0,
    neverBought: 0,
    signups: 0,
    storePurchased: 0,
    storeNeverBought: 0,
    storeCustomers: 0,
  },
  newVsReturningBuyers: { newBuyers: 0, returningBuyers: 0, totalBuyers: 0 },
  ltvDistribution: [],
  ordersPerCustomer: { average: 0, median: 0, buyers: 0, allCustomersAverage: 0 },
  timeToFirstPurchase: { averageDays: 0, medianDays: 0, sample: 0 },
  recency: { averageDays: 0, medianDays: 0, sample: 0, buckets: [] },
  purchaseFrequency: { averageDays: 0, medianDays: 0, sample: 0 },
  emailOptIn: { count: 0, total: 0, rate: 0 },
  smsOptIn: { count: 0, total: 0, rate: 0 },
  customersByTag: [],
  segments: [],
  languageMix: [],
  aovByCountry: [],
  aovByState: [],
  aovByCity: [],
  salesByPin: [],
};

function normalizeCustomerInsights(
  data: AnalyticsCustomerInsights | undefined,
): AnalyticsCustomerInsights {
  const src = data ?? EMPTY_CUSTOMER_INSIGHTS;
  return {
    newCustomers: src.newCustomers ?? 0,
    purchasedVsNeverBought: {
      ...EMPTY_CUSTOMER_INSIGHTS.purchasedVsNeverBought,
      ...(src.purchasedVsNeverBought ?? {}),
    },
    newVsReturningBuyers: {
      ...EMPTY_CUSTOMER_INSIGHTS.newVsReturningBuyers,
      ...(src.newVsReturningBuyers ?? {}),
    },
    ltvDistribution: Array.isArray(src.ltvDistribution) ? src.ltvDistribution : [],
    ordersPerCustomer: {
      ...EMPTY_CUSTOMER_INSIGHTS.ordersPerCustomer,
      ...(src.ordersPerCustomer ?? {}),
    },
    timeToFirstPurchase: {
      ...EMPTY_CUSTOMER_INSIGHTS.timeToFirstPurchase,
      ...(src.timeToFirstPurchase ?? {}),
    },
    recency: {
      averageDays: src.recency?.averageDays ?? 0,
      medianDays: src.recency?.medianDays ?? 0,
      sample: src.recency?.sample ?? 0,
      buckets: Array.isArray(src.recency?.buckets) ? src.recency.buckets : [],
    },
    purchaseFrequency: {
      ...EMPTY_CUSTOMER_INSIGHTS.purchaseFrequency,
      ...(src.purchaseFrequency ?? {}),
    },
    emailOptIn: { ...EMPTY_CUSTOMER_INSIGHTS.emailOptIn, ...(src.emailOptIn ?? {}) },
    smsOptIn: { ...EMPTY_CUSTOMER_INSIGHTS.smsOptIn, ...(src.smsOptIn ?? {}) },
    customersByTag: Array.isArray(src.customersByTag) ? src.customersByTag : [],
    segments: Array.isArray(src.segments) ? src.segments : [],
    languageMix: Array.isArray(src.languageMix) ? src.languageMix : [],
    aovByCountry: Array.isArray(src.aovByCountry) ? src.aovByCountry : [],
    aovByState: Array.isArray(src.aovByState) ? src.aovByState : [],
    aovByCity: Array.isArray(src.aovByCity) ? src.aovByCity : [],
    salesByPin: Array.isArray(src.salesByPin) ? src.salesByPin : [],
  };
}

const EMPTY_CONTENT_INSIGHTS: AnalyticsContentInsights = {
  newsletter: {
    signups: 0,
    unsubscribes: 0,
    netList: 0,
    unsubRate: 0,
    subscribeRate: 0,
    storeSubscribed: 0,
    storeUnsubscribed: 0,
    storeTotal: 0,
    listMix: [],
    movementMix: [],
  },
  contactForm: {
    volume: 0,
    unread: 0,
    spam: 0,
    read: 0,
    spamRate: 0,
    readRate: 0,
    unreadRate: 0,
    withPhone: 0,
    withoutPhone: 0,
    storeUnread: 0,
    storeRead: 0,
    storeSpam: 0,
    storeTotal: 0,
    statusMix: [],
    storeStatusMix: [],
    phoneMix: [],
    recent: [],
  },
  blogPosts: {
    blogs: 0,
    published: 0,
    created: 0,
    hidden: 0,
    publishRate: 0,
    visibleRate: 0,
    storeVisible: 0,
    storeHidden: 0,
    storeTotal: 0,
    withFeaturedImage: 0,
    withoutFeaturedImage: 0,
    withExcerpt: 0,
    withoutExcerpt: 0,
    withTags: 0,
    withoutTags: 0,
    byAuthor: [],
    byTag: [],
    visibilityMix: [],
    rangeVisibilityMix: [],
    commentModeMix: [],
    recent: [],
  },
  blogComments: {
    total: 0,
    pending: 0,
    published: 0,
    spam: 0,
    pendingRate: 0,
    publishRate: 0,
    spamRate: 0,
    storePending: 0,
    storePublished: 0,
    storeSpam: 0,
    storeTotal: 0,
    statusMix: [],
    storeStatusMix: [],
    topArticles: [],
  },
  pages: {
    published: 0,
    created: 0,
    hidden: 0,
    publishRate: 0,
    visibleRate: 0,
    storeVisible: 0,
    storeHidden: 0,
    storeTotal: 0,
    withSeoTitle: 0,
    withoutSeoTitle: 0,
    withMetaDescription: 0,
    withoutMetaDescription: 0,
    withContent: 0,
    withoutContent: 0,
    themeMix: [],
    visibilityMix: [],
    rangeVisibilityMix: [],
    recent: [],
  },
};

function normalizeContentInsights(
  data: AnalyticsContentInsights | undefined,
): AnalyticsContentInsights {
  const src = data ?? EMPTY_CONTENT_INSIGHTS;
  return {
    newsletter: {
      ...EMPTY_CONTENT_INSIGHTS.newsletter,
      ...(src.newsletter ?? {}),
      listMix: Array.isArray(src.newsletter?.listMix) ? src.newsletter.listMix : [],
      movementMix: Array.isArray(src.newsletter?.movementMix) ? src.newsletter.movementMix : [],
    },
    contactForm: {
      ...EMPTY_CONTENT_INSIGHTS.contactForm,
      ...(src.contactForm ?? {}),
      statusMix: Array.isArray(src.contactForm?.statusMix) ? src.contactForm.statusMix : [],
      storeStatusMix: Array.isArray(src.contactForm?.storeStatusMix)
        ? src.contactForm.storeStatusMix
        : [],
      phoneMix: Array.isArray(src.contactForm?.phoneMix) ? src.contactForm.phoneMix : [],
      recent: Array.isArray(src.contactForm?.recent) ? src.contactForm.recent : [],
    },
    blogPosts: {
      ...EMPTY_CONTENT_INSIGHTS.blogPosts,
      ...(src.blogPosts ?? {}),
      byAuthor: Array.isArray(src.blogPosts?.byAuthor) ? src.blogPosts.byAuthor : [],
      byTag: Array.isArray(src.blogPosts?.byTag) ? src.blogPosts.byTag : [],
      visibilityMix: Array.isArray(src.blogPosts?.visibilityMix) ? src.blogPosts.visibilityMix : [],
      rangeVisibilityMix: Array.isArray(src.blogPosts?.rangeVisibilityMix)
        ? src.blogPosts.rangeVisibilityMix
        : [],
      commentModeMix: Array.isArray(src.blogPosts?.commentModeMix)
        ? src.blogPosts.commentModeMix
        : [],
      recent: Array.isArray(src.blogPosts?.recent) ? src.blogPosts.recent : [],
    },
    blogComments: {
      ...EMPTY_CONTENT_INSIGHTS.blogComments,
      ...(src.blogComments ?? {}),
      statusMix: Array.isArray(src.blogComments?.statusMix) ? src.blogComments.statusMix : [],
      storeStatusMix: Array.isArray(src.blogComments?.storeStatusMix)
        ? src.blogComments.storeStatusMix
        : [],
      topArticles: Array.isArray(src.blogComments?.topArticles) ? src.blogComments.topArticles : [],
    },
    pages: {
      ...EMPTY_CONTENT_INSIGHTS.pages,
      ...(src.pages ?? {}),
      themeMix: Array.isArray(src.pages?.themeMix) ? src.pages.themeMix : [],
      visibilityMix: Array.isArray(src.pages?.visibilityMix) ? src.pages.visibilityMix : [],
      rangeVisibilityMix: Array.isArray(src.pages?.rangeVisibilityMix)
        ? src.pages.rangeVisibilityMix
        : [],
      recent: Array.isArray(src.pages?.recent) ? src.pages.recent : [],
    },
  };
}

const EMPTY_PRODUCT_INSIGHTS: AnalyticsProductInsights = {
  daySpan: 1,
  topSkus: [],
  topOptions: [],
  salesByVendor: [],
  salesByType: [],
  salesByCategory: [],
  salesByTag: [],
  collections: [],
  margin: {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    marginRate: 0,
    units: 0,
    unitsMissingCost: 0,
  },
  digitalMix: {
    physicalSales: 0,
    physicalUnits: 0,
    digitalSales: 0,
    digitalUnits: 0,
    digitalRate: 0,
  },
  catalog: { active: 0, draft: 0, total: 0, activeRate: 0 },
  markdown: {
    catalogOnSale: 0,
    catalogTotal: 0,
    catalogRate: 0,
    soldOnSaleUnits: 0,
    soldUnits: 0,
    soldOnSaleRate: 0,
  },
};

function normalizeProductInsights(
  data: AnalyticsProductInsights | undefined,
): AnalyticsProductInsights {
  const src = data ?? EMPTY_PRODUCT_INSIGHTS;
  return {
    daySpan: src.daySpan || 1,
    topSkus: Array.isArray(src.topSkus) ? src.topSkus : [],
    topOptions: Array.isArray(src.topOptions) ? src.topOptions : [],
    salesByVendor: Array.isArray(src.salesByVendor) ? src.salesByVendor : [],
    salesByType: Array.isArray(src.salesByType) ? src.salesByType : [],
    salesByCategory: Array.isArray(src.salesByCategory) ? src.salesByCategory : [],
    salesByTag: Array.isArray(src.salesByTag) ? src.salesByTag : [],
    collections: Array.isArray(src.collections) ? src.collections : [],
    margin: { ...EMPTY_PRODUCT_INSIGHTS.margin, ...(src.margin ?? {}) },
    digitalMix: { ...EMPTY_PRODUCT_INSIGHTS.digitalMix, ...(src.digitalMix ?? {}) },
    catalog: { ...EMPTY_PRODUCT_INSIGHTS.catalog, ...(src.catalog ?? {}) },
    markdown: { ...EMPTY_PRODUCT_INSIGHTS.markdown, ...(src.markdown ?? {}) },
  };
}

const EMPTY_INVENTORY_INSIGHTS: AnalyticsInventoryInsights = {
  daySpan: 1,
  totals: {
    onHand: 0,
    available: 0,
    committed: 0,
    incoming: 0,
    unavailable: 0,
    value: 0,
    skusMissingCost: 0,
    daysOfCover: 0,
  },
  unavailableBreakdown: {
    damaged: 0,
    qualityControl: 0,
    safetyStock: 0,
    other: 0,
  },
  bySku: [],
  byLocation: [],
  committedBySku: [],
  coverRisk: [],
};

function normalizeInventoryInsights(
  data: AnalyticsInventoryInsights | undefined,
): AnalyticsInventoryInsights {
  const src = data ?? EMPTY_INVENTORY_INSIGHTS;
  return {
    daySpan: src.daySpan || 1,
    totals: { ...EMPTY_INVENTORY_INSIGHTS.totals, ...(src.totals ?? {}) },
    unavailableBreakdown: {
      ...EMPTY_INVENTORY_INSIGHTS.unavailableBreakdown,
      ...(src.unavailableBreakdown ?? {}),
    },
    bySku: Array.isArray(src.bySku) ? src.bySku : [],
    byLocation: Array.isArray(src.byLocation) ? src.byLocation : [],
    committedBySku: Array.isArray(src.committedBySku) ? src.committedBySku : [],
    coverRisk: Array.isArray(src.coverRisk) ? src.coverRisk : [],
  };
}

function normalizeInsights(data: AnalyticsInsights | undefined): AnalyticsInsights {
  const src = data ?? EMPTY_INSIGHTS;
  return {
    salesBreakdown: { ...EMPTY_INSIGHTS.salesBreakdown, ...(src.salesBreakdown ?? {}) },
    returningCustomerRate: {
      ...EMPTY_INSIGHTS.returningCustomerRate,
      ...(src.returningCustomerRate ?? {}),
    },
    repeatPurchaseRate: { ...EMPTY_INSIGHTS.repeatPurchaseRate, ...(src.repeatPurchaseRate ?? {}) },
    orderHealth: { ...EMPTY_INSIGHTS.orderHealth, ...(src.orderHealth ?? {}) },
    sparkline: {
      grossSales: Array.isArray(src.sparkline?.grossSales) ? src.sparkline.grossSales : [],
      orders: Array.isArray(src.sparkline?.orders) ? src.sparkline.orders : [],
      ordersFulfilled: Array.isArray(src.sparkline?.ordersFulfilled)
        ? src.sparkline.ordersFulfilled
        : [],
      returningRate: Array.isArray(src.sparkline?.returningRate) ? src.sparkline.returningRate : [],
    },
    salesByLocation: Array.isArray(src.salesByLocation) ? src.salesByLocation : [],
    salesByPaymentMethod: Array.isArray(src.salesByPaymentMethod) ? src.salesByPaymentMethod : [],
    sellThrough: Array.isArray(src.sellThrough) ? src.sellThrough : [],
    topCustomers: Array.isArray(src.topCustomers) ? src.topCustomers : [],
    inventoryRisk: Array.isArray(src.inventoryRisk) ? src.inventoryRisk : [],
    recentOrders: Array.isArray(src.recentOrders) ? src.recentOrders : [],
  };
}

function toIsoDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sameRange(a: AnalyticsDateRange | null, b: AnalyticsDateRange | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.from.getTime() === b.from.getTime() && a.to.getTime() === b.to.getTime();
}

function normalizeAov(data: AnalyticsAovOverTime | undefined): AnalyticsAovOverTime {
  const src = data ?? EMPTY_AOV_OVER_TIME;
  return {
    averageOrderValue: src.averageOrderValue ?? 0,
    orders: src.orders ?? 0,
    totalGrossSales: src.totalGrossSales ?? 0,
    bucket: src.bucket ?? 'hour',
    timezone: src.timezone ?? EMPTY_AOV_OVER_TIME.timezone,
    points: Array.isArray(src.points) ? src.points : [],
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [compareSummary, setCompareSummary] = useState<AnalyticsSummary | null>(null);
  const [salesOverTime, setSalesOverTime] = useState<AnalyticsSalesOverTime>(EMPTY_SALES_OVER_TIME);
  const [compareSalesOverTime, setCompareSalesOverTime] = useState<AnalyticsSalesOverTime | null>(
    null,
  );
  const [aovOverTime, setAovOverTime] = useState<AnalyticsAovOverTime>(EMPTY_AOV_OVER_TIME);
  const [compareAovOverTime, setCompareAovOverTime] = useState<AnalyticsAovOverTime | null>(null);
  const [salesByProduct, setSalesByProduct] =
    useState<AnalyticsSalesByProduct>(EMPTY_SALES_BY_PRODUCT);
  const [insights, setInsights] = useState<AnalyticsInsights>(EMPTY_INSIGHTS);
  const [compareInsights, setCompareInsights] = useState<AnalyticsInsights | null>(null);
  const [customerInsights, setCustomerInsights] =
    useState<AnalyticsCustomerInsights>(EMPTY_CUSTOMER_INSIGHTS);
  const [compareCustomerInsights, setCompareCustomerInsights] =
    useState<AnalyticsCustomerInsights | null>(null);
  const [contentInsights, setContentInsights] =
    useState<AnalyticsContentInsights>(EMPTY_CONTENT_INSIGHTS);
  const [compareContentInsights, setCompareContentInsights] =
    useState<AnalyticsContentInsights | null>(null);
  const [productInsights, setProductInsights] =
    useState<AnalyticsProductInsights>(EMPTY_PRODUCT_INSIGHTS);
  const [compareProductInsights, setCompareProductInsights] =
    useState<AnalyticsProductInsights | null>(null);
  const [inventoryInsights, setInventoryInsights] =
    useState<AnalyticsInventoryInsights>(EMPTY_INVENTORY_INSIGHTS);
  const [compareInventoryInsights, setCompareInventoryInsights] =
    useState<AnalyticsInventoryInsights | null>(null);
  const [range, setRangeState] = useState<AnalyticsDateRange | null>(null);
  const [compareRange, setCompareRangeState] = useState<AnalyticsDateRange | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('yesterday');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRange = useCallback((next: AnalyticsDateRange) => {
    setRangeState((prev) => {
      if (sameRange(prev, next)) return prev;
      return next;
    });
  }, []);

  const setCompare = useCallback(
    (payload: { mode: CompareMode; range: AnalyticsDateRange | null }) => {
      setCompareMode(payload.mode);
      setCompareRangeState((prev) => {
        if (sameRange(prev, payload.range)) return prev;
        return payload.range;
      });
    },
    [],
  );

  const fetchSummary = useCallback(
    async (storeId: string, overrideRange?: AnalyticsDateRange) => {
      const activeRange = overrideRange ?? range;
      if (!storeId) {
        throw new Error('storeId is required');
      }
      if (!activeRange) {
        throw new Error('Date range is required');
      }

      const params = {
        storeId,
        from: toIsoDateParam(activeRange.from),
        to: toIsoDateParam(activeRange.to),
      };

      try {
        setLoading(true);
        setError(null);

        const [summaryRes, seriesRes, aovRes, byProductRes, insightsRes] = await Promise.all([
          axiosi.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', { params }),
          axiosi.get<ApiResponse<AnalyticsSalesOverTime>>('/analytics/sales-over-time', { params }),
          axiosi.get<ApiResponse<AnalyticsAovOverTime>>('/analytics/aov-over-time', { params }),
          axiosi.get<ApiResponse<AnalyticsSalesByProduct>>('/analytics/sales-by-product', {
            params: { ...params, limit: 8 },
          }),
          axiosi.get<ApiResponse<AnalyticsInsights>>('/analytics/insights', { params }),
        ]);

        if (!summaryRes.data.success) {
          throw new Error(summaryRes.data.message || 'Failed to fetch analytics summary');
        }
        if (!seriesRes.data.success) {
          throw new Error(seriesRes.data.message || 'Failed to fetch sales over time');
        }
        if (!aovRes.data.success) {
          throw new Error(aovRes.data.message || 'Failed to fetch average order value');
        }
        if (!byProductRes.data.success) {
          throw new Error(byProductRes.data.message || 'Failed to fetch sales by product');
        }
        if (!insightsRes.data.success) {
          throw new Error(insightsRes.data.message || 'Failed to fetch analytics insights');
        }

        const summaryData = summaryRes.data.data ?? EMPTY_SUMMARY;
        setSummary({
          orders: summaryData.orders ?? 0,
          ordersFulfilled: summaryData.ordersFulfilled ?? 0,
          grossSales: summaryData.grossSales ?? 0,
        });

        const seriesData = seriesRes.data.data ?? EMPTY_SALES_OVER_TIME;
        setSalesOverTime({
          totalGrossSales: seriesData.totalGrossSales ?? 0,
          bucket: seriesData.bucket ?? 'hour',
          timezone: seriesData.timezone ?? EMPTY_SALES_OVER_TIME.timezone,
          points: Array.isArray(seriesData.points) ? seriesData.points : [],
        });

        setAovOverTime(normalizeAov(aovRes.data.data));

        const byProductData = byProductRes.data.data ?? EMPTY_SALES_BY_PRODUCT;
        setSalesByProduct({
          totalSales: byProductData.totalSales ?? 0,
          products: Array.isArray(byProductData.products) ? byProductData.products : [],
        });
        setInsights(normalizeInsights(insightsRes.data.data));

        if (compareRange) {
          const compareParams = {
            storeId,
            from: toIsoDateParam(compareRange.from),
            to: toIsoDateParam(compareRange.to),
          };
          const [compareSummaryRes, compareSeriesRes, compareAovRes, compareInsightsRes] =
            await Promise.all([
            axiosi.get<ApiResponse<AnalyticsSummary>>('/analytics/summary', {
              params: compareParams,
            }),
            axiosi.get<ApiResponse<AnalyticsSalesOverTime>>('/analytics/sales-over-time', {
              params: compareParams,
            }),
            axiosi.get<ApiResponse<AnalyticsAovOverTime>>('/analytics/aov-over-time', {
              params: compareParams,
            }),
            axiosi.get<ApiResponse<AnalyticsInsights>>('/analytics/insights', {
              params: compareParams,
            }),
          ]);

          if (!compareSummaryRes.data.success) {
            throw new Error(compareSummaryRes.data.message || 'Failed to fetch compare summary');
          }
          if (!compareSeriesRes.data.success) {
            throw new Error(
              compareSeriesRes.data.message || 'Failed to fetch compare sales over time',
            );
          }
          if (!compareAovRes.data.success) {
            throw new Error(
              compareAovRes.data.message || 'Failed to fetch compare average order value',
            );
          }
          if (!compareInsightsRes.data.success) {
            throw new Error(
              compareInsightsRes.data.message || 'Failed to fetch compare analytics insights',
            );
          }

          const compareSummaryData = compareSummaryRes.data.data ?? EMPTY_SUMMARY;
          setCompareSummary({
            orders: compareSummaryData.orders ?? 0,
            ordersFulfilled: compareSummaryData.ordersFulfilled ?? 0,
            grossSales: compareSummaryData.grossSales ?? 0,
          });
          const compareSeriesData = compareSeriesRes.data.data ?? EMPTY_SALES_OVER_TIME;
          setCompareSalesOverTime({
            totalGrossSales: compareSeriesData.totalGrossSales ?? 0,
            bucket: compareSeriesData.bucket ?? 'hour',
            timezone: compareSeriesData.timezone ?? EMPTY_SALES_OVER_TIME.timezone,
            points: Array.isArray(compareSeriesData.points) ? compareSeriesData.points : [],
          });
          setCompareAovOverTime(normalizeAov(compareAovRes.data.data));
          setCompareInsights(normalizeInsights(compareInsightsRes.data.data));
        } else {
          setCompareSummary(null);
          setCompareSalesOverTime(null);
          setCompareAovOverTime(null);
          setCompareInsights(null);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch analytics';
        setError(msg);
        setSummary(EMPTY_SUMMARY);
        setCompareSummary(null);
        setSalesOverTime(EMPTY_SALES_OVER_TIME);
        setCompareSalesOverTime(null);
        setAovOverTime(EMPTY_AOV_OVER_TIME);
        setCompareAovOverTime(null);
        setSalesByProduct(EMPTY_SALES_BY_PRODUCT);
        setInsights(EMPTY_INSIGHTS);
        setCompareInsights(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [range, compareRange],
  );

  const fetchCustomerInsights = useCallback(
    async (storeId: string, overrideRange?: AnalyticsDateRange) => {
      const activeRange = overrideRange ?? range;
      if (!storeId) {
        throw new Error('storeId is required');
      }
      if (!activeRange) {
        throw new Error('Date range is required');
      }

      const params = {
        storeId,
        from: toIsoDateParam(activeRange.from),
        to: toIsoDateParam(activeRange.to),
      };

      try {
        setLoading(true);
        setError(null);

        const customersRes = await axiosi.get<ApiResponse<AnalyticsCustomerInsights>>(
          '/analytics/customers',
          { params },
        );
        if (!customersRes.data.success) {
          throw new Error(customersRes.data.message || 'Failed to fetch customer analytics');
        }
        setCustomerInsights(normalizeCustomerInsights(customersRes.data.data));

        if (compareRange) {
          const compareCustomersRes = await axiosi.get<ApiResponse<AnalyticsCustomerInsights>>(
            '/analytics/customers',
            {
              params: {
                storeId,
                from: toIsoDateParam(compareRange.from),
                to: toIsoDateParam(compareRange.to),
              },
            },
          );
          if (!compareCustomersRes.data.success) {
            throw new Error(
              compareCustomersRes.data.message || 'Failed to fetch compare customer analytics',
            );
          }
          setCompareCustomerInsights(normalizeCustomerInsights(compareCustomersRes.data.data));
        } else {
          setCompareCustomerInsights(null);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch customer analytics';
        setError(msg);
        setCustomerInsights(EMPTY_CUSTOMER_INSIGHTS);
        setCompareCustomerInsights(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [range, compareRange],
  );

  const fetchContentInsights = useCallback(
    async (storeId: string, overrideRange?: AnalyticsDateRange) => {
      const activeRange = overrideRange ?? range;
      if (!storeId) {
        throw new Error('storeId is required');
      }
      if (!activeRange) {
        throw new Error('Date range is required');
      }

      const params = {
        storeId,
        from: toIsoDateParam(activeRange.from),
        to: toIsoDateParam(activeRange.to),
      };

      try {
        setLoading(true);
        setError(null);

        const contentRes = await axiosi.get<ApiResponse<AnalyticsContentInsights>>(
          '/analytics/content',
          { params },
        );
        if (!contentRes.data.success) {
          throw new Error(contentRes.data.message || 'Failed to fetch content analytics');
        }
        setContentInsights(normalizeContentInsights(contentRes.data.data));

        if (compareRange) {
          const compareContentRes = await axiosi.get<ApiResponse<AnalyticsContentInsights>>(
            '/analytics/content',
            {
              params: {
                storeId,
                from: toIsoDateParam(compareRange.from),
                to: toIsoDateParam(compareRange.to),
              },
            },
          );
          if (!compareContentRes.data.success) {
            throw new Error(
              compareContentRes.data.message || 'Failed to fetch compare content analytics',
            );
          }
          setCompareContentInsights(normalizeContentInsights(compareContentRes.data.data));
        } else {
          setCompareContentInsights(null);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch content analytics';
        setError(msg);
        setContentInsights(EMPTY_CONTENT_INSIGHTS);
        setCompareContentInsights(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [range, compareRange],
  );

  const fetchProductInsights = useCallback(
    async (storeId: string, overrideRange?: AnalyticsDateRange) => {
      const activeRange = overrideRange ?? range;
      if (!storeId) {
        throw new Error('storeId is required');
      }
      if (!activeRange) {
        throw new Error('Date range is required');
      }

      const params = {
        storeId,
        from: toIsoDateParam(activeRange.from),
        to: toIsoDateParam(activeRange.to),
      };

      try {
        setLoading(true);
        setError(null);

        const productsRes = await axiosi.get<ApiResponse<AnalyticsProductInsights>>(
          '/analytics/products',
          { params },
        );
        if (!productsRes.data.success) {
          throw new Error(productsRes.data.message || 'Failed to fetch product analytics');
        }
        setProductInsights(normalizeProductInsights(productsRes.data.data));

        if (compareRange) {
          const compareProductsRes = await axiosi.get<ApiResponse<AnalyticsProductInsights>>(
            '/analytics/products',
            {
              params: {
                storeId,
                from: toIsoDateParam(compareRange.from),
                to: toIsoDateParam(compareRange.to),
              },
            },
          );
          if (!compareProductsRes.data.success) {
            throw new Error(
              compareProductsRes.data.message || 'Failed to fetch compare product analytics',
            );
          }
          setCompareProductInsights(normalizeProductInsights(compareProductsRes.data.data));
        } else {
          setCompareProductInsights(null);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch product analytics';
        setError(msg);
        setProductInsights(EMPTY_PRODUCT_INSIGHTS);
        setCompareProductInsights(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [range, compareRange],
  );

  const fetchInventoryInsights = useCallback(
    async (storeId: string, overrideRange?: AnalyticsDateRange) => {
      const activeRange = overrideRange ?? range;
      if (!storeId) {
        throw new Error('storeId is required');
      }
      if (!activeRange) {
        throw new Error('Date range is required');
      }

      const params = {
        storeId,
        from: toIsoDateParam(activeRange.from),
        to: toIsoDateParam(activeRange.to),
      };

      try {
        setLoading(true);
        setError(null);

        const inventoryRes = await axiosi.get<ApiResponse<AnalyticsInventoryInsights>>(
          '/analytics/inventory',
          { params },
        );
        if (!inventoryRes.data.success) {
          throw new Error(inventoryRes.data.message || 'Failed to fetch inventory analytics');
        }
        setInventoryInsights(normalizeInventoryInsights(inventoryRes.data.data));

        if (compareRange) {
          const compareInventoryRes = await axiosi.get<ApiResponse<AnalyticsInventoryInsights>>(
            '/analytics/inventory',
            {
              params: {
                storeId,
                from: toIsoDateParam(compareRange.from),
                to: toIsoDateParam(compareRange.to),
              },
            },
          );
          if (!compareInventoryRes.data.success) {
            throw new Error(
              compareInventoryRes.data.message || 'Failed to fetch compare inventory analytics',
            );
          }
          setCompareInventoryInsights(normalizeInventoryInsights(compareInventoryRes.data.data));
        } else {
          setCompareInventoryInsights(null);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch inventory analytics';
        setError(msg);
        setInventoryInsights(EMPTY_INVENTORY_INSIGHTS);
        setCompareInventoryInsights(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [range, compareRange],
  );

  const value = useMemo(
    () => ({
      summary,
      compareSummary,
      salesOverTime,
      compareSalesOverTime,
      aovOverTime,
      compareAovOverTime,
      salesByProduct,
      insights,
      compareInsights,
      customerInsights,
      compareCustomerInsights,
      contentInsights,
      compareContentInsights,
      productInsights,
      compareProductInsights,
      inventoryInsights,
      compareInventoryInsights,
      range,
      compareRange,
      compareMode,
      loading,
      error,
      setRange,
      setCompare,
      fetchSummary,
      fetchCustomerInsights,
      fetchContentInsights,
      fetchProductInsights,
      fetchInventoryInsights,
    }),
    [
      summary,
      compareSummary,
      salesOverTime,
      compareSalesOverTime,
      aovOverTime,
      compareAovOverTime,
      salesByProduct,
      insights,
      compareInsights,
      customerInsights,
      compareCustomerInsights,
      contentInsights,
      compareContentInsights,
      productInsights,
      compareProductInsights,
      inventoryInsights,
      compareInventoryInsights,
      range,
      compareRange,
      compareMode,
      loading,
      error,
      setRange,
      setCompare,
      fetchSummary,
      fetchCustomerInsights,
      fetchContentInsights,
      fetchProductInsights,
      fetchInventoryInsights,
    ],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export function useAnalytics(): AnalyticsContextType {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return ctx;
}
