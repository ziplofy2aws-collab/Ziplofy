/**
 * Demo products for a fixed store — mirrors createProduct in product.controller.ts:
 * 1) Product.create with variants[] on the product (option axes only)
 * 2) ProductVariant.insertMany — cartesian combinations when variants.length > 0,
 *    otherwise one synthetic variant (empty optionValues map)
 * 3) InventoryLevelModel.insertMany — one row per (variant × location), same defaults as API
 *
 * Prerequisites: store exists, at least one Location for that store, at least one Category
 * (e.g. seed:categories). Ensures ProductType + Vendor for the store (creates if missing).
 *
 * Idempotent for these urlHandles: removes prior demo products + their variants + inventory.
 *
 * Override store: SEED_STORE_ID=<24hex> npm run seed:products-demo
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';
import { InventoryLevelModel } from '../models/inventory-level/inventory-level.model';
import { LocationModel } from '../models/location/location.model';
import { Category } from '../models/category/category.model';
import { ProductType } from '../models/product-type/product-type.model';
import { Vendor } from '../models/vendor/vendor.model';
import { Store } from '../models/store/store.model';
import { IProductVariant, ProductVariant } from '../models/product/product-variants.model';
import { Product } from '../models/product/product.model';

dotenv.config();

const DEFAULT_STORE_ID = '69c0e15f1e7974f7c551af66';

const PLACEHOLDER_IMG = 'https://placehold.co/600x600/e2e8f0/1e293b?text=Demo';

type VariantAxis = { optionName: string; values: string[] };

type SeedProductInput = {
  title: string;
  description: string;
  urlHandle: string;
  sku: string;
  barcode: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  profit?: number;
  marginPercent?: number;
  pageTitle: string;
  metaDescription: string;
  variants?: VariantAxis[];
  isPhysicalProduct?: boolean;
  productWeight?: number;
  productWeightUnit?: 'kg' | 'g' | 'lb' | 'oz' | 'ton';
  countryOfOrigin?: string;
  harmonizedSystemCode?: string;
};

/** Same cartesian reduction as product.controller createProduct */
function variantCombos(optionDefs: { name: string; values: string[] }[]): string[][] {
  return optionDefs.reduce<string[][]>((acc, opt) => {
    if (acc.length === 0) return opt.values.map((v) => [v]);
    const next: string[][] = [];
    for (const prev of acc) {
      for (const v of opt.values) next.push([...prev, v]);
    }
    return next;
  }, []);
}

function buildVariantDocs(
  productId: mongoose.Types.ObjectId,
  body: {
    title: string;
    sku: string;
    barcode: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    profit?: number;
    marginPercent?: number;
    variants?: VariantAxis[];
    productWeight?: number;
    productWeightUnit?: string;
    package?: mongoose.Types.ObjectId;
    countryOfOrigin?: string;
    harmonizedSystemCode?: string;
    imageUrls: string[];
    chargeTax?: boolean;
    continueSellingWhenOutOfStock?: boolean;
    isPhysicalProduct?: boolean;
    unitPriceTotalAmount?: number;
    unitPriceTotalAmountMetric?: IProductVariant['unitPriceTotalAmountMetric'];
    unitPriceBaseMeasure?: number;
    unitPriceBaseMeasureMetric?: IProductVariant['unitPriceBaseMeasureMetric'];
  }
): Omit<IProductVariant, '_id'>[] {
  const baseSku =
    body.sku || (body.title ? body.title.replace(/\s+/g, '-').toUpperCase() : 'SKU');

  if (Array.isArray(body.variants) && body.variants.length > 0) {
    const optionDefs = body.variants
      .filter((opt) => opt && Array.isArray(opt.values) && opt.values.length > 0)
      .map((opt) => ({ name: opt.optionName, values: opt.values }));
    const combos = variantCombos(optionDefs);
    return combos.map((vals, idx) => {
      const optionValues = new Map<string, string>();
      optionDefs.forEach((opt, i) => optionValues.set(opt.name, vals[i]));
      return {
        productId,
        optionValues,
        sku: `${baseSku}-${idx + 1}`,
        barcode: body.barcode || null,
        price: typeof body.price === 'number' ? body.price : 0,
        compareAtPrice: typeof body.compareAtPrice === 'number' ? body.compareAtPrice : null,
        cost: typeof body.cost === 'number' ? body.cost : null,
        profit: typeof body.profit === 'number' ? body.profit : null,
        marginPercent: typeof body.marginPercent === 'number' ? body.marginPercent : null,
        weightValue: typeof body.productWeight === 'number' ? body.productWeight : 0,
        weightUnit: body.productWeightUnit || 'kg',
        package: body.package as mongoose.Types.ObjectId,
        countryOfOrigin: body.countryOfOrigin || null,
        hsCode: body.harmonizedSystemCode || null,
        images: Array.isArray(body.imageUrls) ? body.imageUrls : [],
        unitPriceTotalAmount: body.unitPriceTotalAmount,
        unitPriceTotalAmountMetric: body.unitPriceTotalAmountMetric,
        unitPriceBaseMeasure: body.unitPriceBaseMeasure,
        unitPriceBaseMeasureMetric: body.unitPriceBaseMeasureMetric,
        chargeTax: body.chargeTax ?? true,
        outOfStockContinueSelling: !!body.continueSellingWhenOutOfStock,
        isInventoryTrackingEnabled: true,
        isPhysicalProduct: body.isPhysicalProduct ?? true,
        isSynthetic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        depricated: false,
      };
    });
  }

  return [
    {
      productId,
      optionValues: new Map<string, string>(),
      sku: `${baseSku}-1`,
      barcode: body.barcode || null,
      price: typeof body.price === 'number' ? body.price : 0,
      compareAtPrice: typeof body.compareAtPrice === 'number' ? body.compareAtPrice : null,
      cost: typeof body.cost === 'number' ? body.cost : null,
      profit: typeof body.profit === 'number' ? body.profit : null,
      marginPercent: typeof body.marginPercent === 'number' ? body.marginPercent : null,
      weightValue: typeof body.productWeight === 'number' ? body.productWeight : 0,
      weightUnit: body.productWeightUnit || 'kg',
      package: body.package as mongoose.Types.ObjectId,
      countryOfOrigin: body.countryOfOrigin || null,
      hsCode: body.harmonizedSystemCode || null,
      images: Array.isArray(body.imageUrls) ? body.imageUrls : [],
      unitPriceTotalAmount: body.unitPriceTotalAmount,
      unitPriceTotalAmountMetric: body.unitPriceTotalAmountMetric,
      unitPriceBaseMeasure: body.unitPriceBaseMeasure,
      unitPriceBaseMeasureMetric: body.unitPriceBaseMeasureMetric,
      chargeTax: body.chargeTax ?? true,
      outOfStockContinueSelling: !!body.continueSellingWhenOutOfStock,
      isInventoryTrackingEnabled: true,
      isPhysicalProduct: body.isPhysicalProduct ?? true,
      isSynthetic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      depricated: false,
    },
  ];
}

const DEMO_PRODUCTS: SeedProductInput[] = [
  {
    title: 'Classic Cotton T-Shirt',
    description:
      'Soft cotton tee with a relaxed fit. Demo product with color and size options for cartesian variants.',
    urlHandle: 'seed-demo-classic-tshirt',
    sku: 'SEED-TSHIRT',
    barcode: '2000000000001',
    price: 24.99,
    compareAtPrice: 34.99,
    cost: 12,
    profit: 12.99,
    marginPercent: 52,
    pageTitle: 'Classic Cotton T-Shirt',
    metaDescription: 'Demo seeded t-shirt with multiple colors and sizes for storefront testing.',
    variants: [
      { optionName: 'Color', values: ['Red', 'Blue', 'Black'] },
      { optionName: 'Size', values: ['S', 'M', 'L'] },
    ],
    isPhysicalProduct: true,
    productWeight: 0.22,
    productWeightUnit: 'lb',
    countryOfOrigin: 'US',
  },
  {
    title: 'Trail Snapback Hat',
    description: 'Structured cap with mesh panels. Demo hat with color and size grouping.',
    urlHandle: 'seed-demo-trail-snapback-hat',
    sku: 'SEED-HAT',
    barcode: '2000000000002',
    price: 32,
    compareAtPrice: 40,
    cost: 14,
    profit: 18,
    marginPercent: 56,
    pageTitle: 'Trail Snapback Hat',
    metaDescription: 'Demo seeded hat with variant options for catalog and cart flows.',
    variants: [
      { optionName: 'Color', values: ['Navy', 'Olive'] },
      { optionName: 'Size', values: ['S/M', 'L/XL'] },
    ],
    isPhysicalProduct: true,
    productWeight: 0.15,
    productWeightUnit: 'lb',
  },
  {
    title: 'Metal Keychain',
    description: 'Compact branded keychain. Single SKU — no variant dimensions (one synthetic variant).',
    urlHandle: 'seed-demo-metal-keychain',
    sku: 'SEED-KEYCHAIN',
    barcode: '2000000000003',
    price: 8.5,
    cost: 2.5,
    profit: 6,
    marginPercent: 71,
    pageTitle: 'Metal Keychain',
    metaDescription: 'Demo accessory with no variant axes; inventory on one default variant.',
    isPhysicalProduct: true,
    productWeight: 40,
    productWeightUnit: 'g',
  },
  {
    title: 'Performance Spark Plug',
    description: 'Aftermarket spark plug. Demo automotive part with thread size and heat range.',
    urlHandle: 'seed-demo-performance-spark-plug',
    sku: 'SEED-SPARK',
    barcode: '2000000000004',
    price: 18.75,
    compareAtPrice: 22,
    cost: 9,
    profit: 9.75,
    marginPercent: 52,
    pageTitle: 'Performance Spark Plug',
    metaDescription: 'Demo spark plug with thread and heat range variants for fitment-style UX.',
    variants: [
      { optionName: 'Thread', values: ['14mm', '18mm'] },
      { optionName: 'Heat range', values: ['Cold', 'Hot'] },
    ],
    isPhysicalProduct: true,
    productWeight: 55,
    productWeightUnit: 'g',
    harmonizedSystemCode: '85111000',
  },
  {
    title: 'FlowForged Alloy Wheel',
    description: 'Lightweight alloy wheel. Demo with diameter and finish combinations.',
    urlHandle: 'seed-demo-flowforged-alloy-wheel',
    sku: 'SEED-WHEEL',
    barcode: '2000000000005',
    price: 349,
    compareAtPrice: 429,
    cost: 210,
    profit: 139,
    marginPercent: 40,
    pageTitle: 'FlowForged Alloy Wheel',
    metaDescription: 'Demo wheel listing with diameter and finish variant matrix.',
    variants: [
      { optionName: 'Diameter', values: ['17in', '18in'] },
      { optionName: 'Finish', values: ['Matte Black', 'Silver'] },
    ],
    isPhysicalProduct: true,
    productWeight: 10.5,
    productWeightUnit: 'kg',
  },
  {
    title: 'Slim Taper Jeans',
    description: 'Stretch denim jeans. Demo apparel with waist and inseam grid.',
    urlHandle: 'seed-demo-slim-taper-jeans',
    sku: 'SEED-JEANS',
    barcode: '2000000000006',
    price: 79,
    compareAtPrice: 98,
    cost: 38,
    profit: 41,
    marginPercent: 52,
    pageTitle: 'Slim Taper Jeans',
    metaDescription: 'Demo jeans with waist and inseam variants for matrix inventory.',
    variants: [
      { optionName: 'Waist', values: ['30', '32', '34'] },
      { optionName: 'Inseam', values: ['30', '32'] },
    ],
    isPhysicalProduct: true,
    productWeight: 0.65,
    productWeightUnit: 'kg',
  },
  {
    title: 'Signet Ring',
    description: 'Stainless steel signet ring. No variant dimensions — single default variant.',
    urlHandle: 'seed-demo-signet-ring',
    sku: 'SEED-RING',
    barcode: '2000000000007',
    price: 45,
    cost: 18,
    profit: 27,
    marginPercent: 60,
    pageTitle: 'Signet Ring',
    metaDescription: 'Demo jewelry item without options; one synthetic variant only.',
    isPhysicalProduct: true,
    productWeight: 12,
    productWeightUnit: 'g',
  },
];

async function ensureRefs(storeId: mongoose.Types.ObjectId) {
  const store = await Store.findById(storeId);
  if (!store) {
    throw new Error(`Store not found: ${storeId.toHexString()}`);
  }

  const locations = await LocationModel.find({ storeId }).select('_id');
  if (locations.length === 0) {
    throw new Error(
      `No locations for store ${storeId.toHexString()}. Create a location before seeding products.`
    );
  }

  const category = await Category.findOne().sort({ createdAt: 1 });
  if (!category) {
    throw new Error('No categories in DB. Run npm run seed:categories first.');
  }

  const storeIdStr = storeId.toHexString();
  let productType = await ProductType.findOne({ storeId: storeIdStr });
  if (!productType) {
    productType = await ProductType.create({ storeId: storeIdStr, name: 'General' });
    console.log('Created ProductType "General" for store.');
  }

  let vendor = await Vendor.findOne({ storeId });
  if (!vendor) {
    vendor = await Vendor.create({ storeId, name: 'Seed Demo Vendor' });
    console.log('Created Vendor "Seed Demo Vendor" for store.');
  }

  return {
    categoryId: category._id,
    productTypeId: new mongoose.Types.ObjectId(String(productType._id)),
    vendorId: vendor._id,
    locationIds: locations.map((l) => l._id),
  };
}

async function removePreviousDemo(storeId: mongoose.Types.ObjectId, urlHandles: string[]) {
  const existing = await Product.find({ storeId, urlHandle: { $in: urlHandles } }).select('_id');
  const productIds = existing.map((p) => p._id);
  if (productIds.length === 0) return;

  const variants = await ProductVariant.find({ productId: { $in: productIds } }).select('_id');
  const variantIds = variants.map((v) => v._id);

  if (variantIds.length > 0) {
    await InventoryLevelModel.deleteMany({ variantId: { $in: variantIds } });
  }
  await ProductVariant.deleteMany({ productId: { $in: productIds } });
  await Product.deleteMany({ _id: { $in: productIds } });
  console.log(`Removed ${productIds.length} prior demo product(s) and related variants/inventory.`);
}

async function seedOneProduct(
  def: SeedProductInput,
  storeId: mongoose.Types.ObjectId,
  refs: Awaited<ReturnType<typeof ensureRefs>>
) {
  const imageUrls = [PLACEHOLDER_IMG];
  const variantsOnProduct = def.variants ?? [];

  const product = await Product.create({
    title: def.title,
    storeId,
    description: def.description,
    category: refs.categoryId,
    price: def.price,
    compareAtPrice: def.compareAtPrice,
    chargeTax: true,
    cost: def.cost ?? 0,
    profit: def.profit ?? 0,
    marginPercent: def.marginPercent ?? 0,
    inventoryTrackingEnabled: true,
    continueSellingWhenOutOfStock: false,
    sku: def.sku,
    barcode: def.barcode,
    isPhysicalProduct: def.isPhysicalProduct ?? true,
    package: undefined,
    productWeight: def.productWeight,
    productWeightUnit: def.productWeightUnit,
    countryOfOrigin: def.countryOfOrigin,
    harmonizedSystemCode: def.harmonizedSystemCode,
    variants: variantsOnProduct,
    pageTitle: def.pageTitle,
    metaDescription: def.metaDescription,
    urlHandle: def.urlHandle,
    status: 'active',
    onlineStorePublishing: true,
    pointOfSalePublishing: false,
    productType: refs.productTypeId,
    vendor: refs.vendorId,
    tagIds: [],
    imageUrls,
  });

  const variantDocs = buildVariantDocs(product._id, {
    title: def.title,
    sku: def.sku,
    barcode: def.barcode,
    price: def.price,
    compareAtPrice: def.compareAtPrice,
    cost: def.cost,
    profit: def.profit,
    marginPercent: def.marginPercent,
    variants: variantsOnProduct,
    productWeight: def.productWeight,
    productWeightUnit: def.productWeightUnit,
    countryOfOrigin: def.countryOfOrigin,
    harmonizedSystemCode: def.harmonizedSystemCode,
    imageUrls,
    chargeTax: true,
    continueSellingWhenOutOfStock: false,
    isPhysicalProduct: def.isPhysicalProduct ?? true,
  });

  const createdVariants = await ProductVariant.insertMany(variantDocs);

  const inventoryLevelDocs = createdVariants.flatMap((variant) =>
    refs.locationIds.map((locId) => ({
      variantId: variant._id,
      locationId: locId,
      onHand: 0,
      committed: 0,
      unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
      available: 0,
      incoming: 0,
    }))
  );
  await InventoryLevelModel.insertMany(inventoryLevelDocs);

  console.log(
    `  ✓ ${def.title} — ${createdVariants.length} variant(s), ${inventoryLevelDocs.length} inventory row(s)`
  );
}

async function resolveStoreId(): Promise<mongoose.Types.ObjectId | null> {
  const envStoreId = process.env.SEED_STORE_ID;
  if (envStoreId) {
    if (!mongoose.Types.ObjectId.isValid(envStoreId)) {
      throw new Error(`Invalid SEED_STORE_ID: ${envStoreId}`);
    }
    const found = await Store.findById(envStoreId).select('_id').lean();
    if (!found?._id) {
      throw new Error(`SEED_STORE_ID not found: ${envStoreId}`);
    }
    return new mongoose.Types.ObjectId(String(found._id));
  }

  if (mongoose.Types.ObjectId.isValid(DEFAULT_STORE_ID)) {
    const foundDefault = await Store.findById(DEFAULT_STORE_ID).select('_id').lean();
    if (foundDefault?._id) {
      return new mongoose.Types.ObjectId(String(foundDefault._id));
    }
  }

  const firstStore = await Store.findOne().sort({ createdAt: 1 }).select('_id').lean();
  if (!firstStore?._id) {
    return null;
  }
  return new mongoose.Types.ObjectId(String(firstStore._id));
}

async function main() {
  await connectDB();
  const storeId = await resolveStoreId();
  if (!storeId) {
    console.log(
      'No store found. Skipping demo product seed. Create a store first or set SEED_STORE_ID.'
    );
    process.exit(0);
  }

  const handles = DEMO_PRODUCTS.map((p) => p.urlHandle);
  await removePreviousDemo(storeId, handles);
  const refs = await ensureRefs(storeId);

  console.log(`Seeding ${DEMO_PRODUCTS.length} demo products for store ${storeId.toHexString()}…`);
  for (const def of DEMO_PRODUCTS) {
    await seedOneProduct(def, storeId, refs);
  }
  console.log('Demo products seeded successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
