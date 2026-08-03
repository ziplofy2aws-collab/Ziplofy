import { Request, Response } from "express";
import mongoose from "mongoose";
import { SecureUserInfo } from "../middlewares/auth.middleware";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Collections, ICollection } from "../models/collections/collections.model";
import { CollectionEntry } from "../models/collection-entry/collection-entry.model";
import { Product } from "../models/product/product.model";
import { assertOptionalStoreCloudImageUrl } from "../utils/cloud-storage-image.util";
import { sanitizeRichTextHtml } from "../utils/sanitize-html.util";
import { assertStoreAccess } from "../utils/store-access.util";
import {
  isValidCollectionThemeTemplate,
  listCollectionThemeTemplatesForStore,
  normalizeCollectionThemeTemplate,
} from "../utils/collection-theme-template.util";

const COLLECTION_UPDATE_FIELDS = [
  "title",
  "imageUrl",
  "imageAltText",
  "description",
  "pageTitle",
  "metaDescription",
  "urlHandle",
  "productSort",
  "status",
  "themeTemplate",
] as const;

const ALLOWED_SORTS = ["manual", "title-asc", "title-desc", "price-high", "price-low", "newest", "oldest"] as const;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function requireCollectionCreateFields(input: {
  storeId: unknown;
  title: unknown;
  description: unknown;
  pageTitle: unknown;
  metaDescription: unknown;
  urlHandle: unknown;
}): {
  storeId: string;
  title: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
} {
  if (!input.storeId || (typeof input.storeId === "string" && !input.storeId.trim())) {
    throw new CustomError("Store is required to create a collection", 400);
  }

  const title = asTrimmedString(input.title);
  if (!title) throw new CustomError("Collection title is required", 400);
  if (title.length < 2) throw new CustomError("Collection title must be at least 2 characters", 400);

  const descriptionRaw = typeof input.description === "string" ? input.description : "";
  const descriptionPlain = plainTextFromHtml(descriptionRaw);
  if (!descriptionPlain) {
    throw new CustomError("Collection description is required", 400);
  }

  const pageTitle = asTrimmedString(input.pageTitle) || title;
  if (pageTitle.length < 2) {
    throw new CustomError("Page title must be at least 2 characters", 400);
  }

  const metaDescription = asTrimmedString(input.metaDescription) || descriptionPlain || title;
  if (metaDescription.length < 10) {
    throw new CustomError("Meta description must be at least 10 characters", 400);
  }

  const urlHandle = asTrimmedString(input.urlHandle).toLowerCase();
  if (!urlHandle) throw new CustomError("URL handle is required", 400);
  if (urlHandle.length < 2) throw new CustomError("URL handle must be at least 2 characters", 400);
  if (!/^[a-z0-9-]+$/.test(urlHandle)) {
    throw new CustomError("URL handle can only contain lowercase letters, numbers, and hyphens", 400);
  }

  return {
    storeId: String(input.storeId),
    title,
    description: descriptionRaw,
    pageTitle,
    metaDescription,
    urlHandle,
  };
}

async function assertCollectionUrlHandleAvailable(
  storeId: string,
  urlHandle: string,
  excludeId?: string
): Promise<void> {
  const existing = await Collections.findOne({
    storeId,
    urlHandle,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select({ _id: 1 })
    .lean();

  if (existing) {
    throw new CustomError(
      `A collection with the URL handle "${urlHandle}" already exists for this store. Choose a different URL handle.`,
      409
    );
  }
}

function buildCollectionUpdatePayload(body: Record<string, unknown>): Partial<ICollection> {
  const updatePayload: Partial<ICollection> = {};

  for (const field of COLLECTION_UPDATE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    (updatePayload as Record<string, unknown>)[field] = body[field];
  }

  return updatePayload;
}

async function getCollectionOrThrow(id: string) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid collection id is required", 400);
  }

  const collection = await Collections.findById(id).select("storeId");
  if (!collection) {
    throw new CustomError("Collection not found", 404);
  }

  return collection;
}

function validateCollectionStatus(status: unknown): void {
  if (typeof status !== "undefined" && status !== "draft" && status !== "published") {
    throw new CustomError("Invalid status. Allowed values are 'draft' or 'published'", 400);
  }
}

function validateProductSort(productSort: unknown): void {
  if (typeof productSort !== "undefined" && !ALLOWED_SORTS.includes(productSort as (typeof ALLOWED_SORTS)[number])) {
    throw new CustomError("Invalid productSort value", 400);
  }
}

// Create a new collection
export const createCollection = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId: rawStoreId,
    title: rawTitle,
    imageUrl,
    imageAltText,
    description: rawDescription,
    pageTitle: rawPageTitle,
    metaDescription: rawMetaDescription,
    urlHandle: rawUrlHandle,
    productIds,
    productSort,
    status,
    themeTemplate,
  } = req.body as Partial<ICollection> & Record<string, any>;

  const {
    storeId,
    title,
    description,
    pageTitle,
    metaDescription,
    urlHandle,
  } = requireCollectionCreateFields({
    storeId: rawStoreId,
    title: rawTitle,
    description: rawDescription,
    pageTitle: rawPageTitle,
    metaDescription: rawMetaDescription,
    urlHandle: rawUrlHandle,
  });

  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);
  validateCollectionStatus(status);
  validateProductSort(productSort);

  if (typeof themeTemplate !== "undefined" && !isValidCollectionThemeTemplate(themeTemplate)) {
    throw new CustomError("Invalid theme template value", 400);
  }

  await assertCollectionUrlHandleAvailable(storeId, urlHandle);

  const sanitizedDescription = sanitizeRichTextHtml(String(description));
  if (!plainTextFromHtml(sanitizedDescription)) {
    throw new CustomError("Collection description is required", 400);
  }

  await assertOptionalStoreCloudImageUrl(storeId, imageUrl);

  const normalizedProductIds = Array.isArray(productIds)
    ? [...new Set(productIds.filter((id: unknown) => typeof id === "string" && mongoose.isValidObjectId(id)))]
    : [];

  if (Array.isArray(productIds) && normalizedProductIds.length !== productIds.length) {
    throw new CustomError("One or more selected products are invalid", 400);
  }

  if (normalizedProductIds.length > 0) {
    const existingProducts = await Product.find({
      _id: { $in: normalizedProductIds },
      storeId,
      isDeleted: { $ne: true },
    })
      .select({ _id: 1 })
      .lean();

    if (existingProducts.length !== normalizedProductIds.length) {
      throw new CustomError("One or more selected products are invalid for this store", 400);
    }
  }

  const session = await mongoose.startSession();
  let collection: any;
  try {
    await session.withTransaction(async () => {
      const created = await Collections.create(
        [
          {
            storeId,
            title,
            imageUrl,
            imageAltText,
            description: sanitizedDescription,
            pageTitle,
            metaDescription,
            urlHandle,
            themeTemplate: isValidCollectionThemeTemplate(themeTemplate)
              ? normalizeCollectionThemeTemplate(themeTemplate)
              : "default",
            ...(typeof productSort !== "undefined" ? { productSort } : {}),
            ...(typeof status !== "undefined" ? { status } : {}),
          },
        ],
        { session }
      );

      collection = created[0];

      if (normalizedProductIds.length > 0) {
        await CollectionEntry.insertMany(
          normalizedProductIds.map((productId: string, index: number) => ({
            collectionId: collection._id,
            productId,
            position: index + 1,
          })),
          { session, ordered: false }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({ success: true, data: collection, message: "Collection created successfully" });
});

// Get collections by store id
export const getCollectionsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId) throw new CustomError("storeId is required", 400);

  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);

  const collections = await Collections.find({ storeId }).sort({ createdAt: -1 }).lean();

  if (collections.length === 0) {
    res.status(200).json({ success: true, data: [], count: 0 });
    return;
  }

  const collectionIds = collections.map((collection) => collection._id);
  const productCounts = await CollectionEntry.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { collectionId: { $in: collectionIds } } },
    { $group: { _id: "$collectionId", count: { $sum: 1 } } },
  ]);

  const countByCollectionId = new Map(
    productCounts.map((entry) => [String(entry._id), entry.count])
  );

  const data = collections.map((collection) => ({
    ...collection,
    productCount: countByCollectionId.get(String(collection._id)) ?? 0,
  }));

  res.status(200).json({ success: true, data, count: data.length });
});

/** GET /collections/store/:storeId/theme-templates */
export const listCollectionThemeTemplates = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);
  try {
    const data = await listCollectionThemeTemplatesForStore(storeId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[listCollectionThemeTemplates]", err);
    res.status(200).json({
      success: true,
      data: [{ value: "default", label: "Default collection" }],
    });
  }
});

// Get collection by id
export const getCollectionById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid collection id is required", 400);
  }

  const collection = await Collections.findById(id).lean();
  if (!collection) {
    throw new CustomError("Collection not found", 404);
  }

  await assertStoreAccess(collection.storeId.toString(), req.user as SecureUserInfo | undefined);

  const productCount = await CollectionEntry.countDocuments({ collectionId: collection._id });

  res.status(200).json({
    success: true,
    data: {
      ...collection,
      productCount,
    },
  });
});

// Update collection
export const updateCollection = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await getCollectionOrThrow(id);
  const storeId = existing.storeId.toString();

  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);

  const updatePayload = buildCollectionUpdatePayload(req.body as Record<string, unknown>);
  if (!Object.keys(updatePayload).length) {
    throw new CustomError("No valid fields provided to update", 400);
  }

  validateCollectionStatus(updatePayload.status);
  validateProductSort(updatePayload.productSort);

  if (Object.prototype.hasOwnProperty.call(updatePayload, "themeTemplate")) {
    if (!isValidCollectionThemeTemplate(updatePayload.themeTemplate)) {
      throw new CustomError("Invalid theme template value", 400);
    }
    updatePayload.themeTemplate = normalizeCollectionThemeTemplate(updatePayload.themeTemplate);
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "description")) {
    updatePayload.description = sanitizeRichTextHtml(String(updatePayload.description ?? ""));
    if (!plainTextFromHtml(String(updatePayload.description))) {
      throw new CustomError("Collection description is required", 400);
    }
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "title")) {
    const title = asTrimmedString(updatePayload.title);
    if (!title) throw new CustomError("Collection title is required", 400);
    if (title.length < 2) throw new CustomError("Collection title must be at least 2 characters", 400);
    updatePayload.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "pageTitle")) {
    const pageTitle = asTrimmedString(updatePayload.pageTitle);
    if (!pageTitle) throw new CustomError("Page title is required", 400);
    if (pageTitle.length < 2) throw new CustomError("Page title must be at least 2 characters", 400);
    updatePayload.pageTitle = pageTitle;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "metaDescription")) {
    const metaDescription = asTrimmedString(updatePayload.metaDescription);
    if (!metaDescription) throw new CustomError("Meta description is required", 400);
    if (metaDescription.length < 10) {
      throw new CustomError("Meta description must be at least 10 characters", 400);
    }
    updatePayload.metaDescription = metaDescription;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "urlHandle")) {
    const urlHandle = asTrimmedString(updatePayload.urlHandle).toLowerCase();
    if (!urlHandle) throw new CustomError("URL handle is required", 400);
    if (urlHandle.length < 2) throw new CustomError("URL handle must be at least 2 characters", 400);
    if (!/^[a-z0-9-]+$/.test(urlHandle)) {
      throw new CustomError("URL handle can only contain lowercase letters, numbers, and hyphens", 400);
    }
    await assertCollectionUrlHandleAvailable(storeId, urlHandle, id);
    updatePayload.urlHandle = urlHandle;
  }

  if (Object.prototype.hasOwnProperty.call(updatePayload, "imageUrl")) {
    await assertOptionalStoreCloudImageUrl(storeId, updatePayload.imageUrl);
  }

  const updated = await Collections.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
  if (!updated) throw new CustomError("Collection not found", 404);

  res.status(200).json({ success: true, data: updated, message: "Collection updated successfully" });
});

// Delete collection
export const deleteCollection = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await getCollectionOrThrow(id);

  await assertStoreAccess(existing.storeId.toString(), req.user as SecureUserInfo | undefined);

  const deleted = await Collections.findByIdAndDelete(id);
  if (!deleted) throw new CustomError("Collection not found", 404);

  res.status(200).json({ success: true, data: { deletedId: id }, message: "Collection deleted successfully" });
});

// Search collections with fuzzy search
export const searchCollections = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { q, page = 1, limit = 10 } = req.query;

  if (!storeId) throw new CustomError("storeId is required", 400);
  if (!q || typeof q !== "string") throw new CustomError("Search query 'q' is required", 400);

  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);

  const skip = (Number(page) - 1) * Number(limit);

  const searchCriteria = {
    storeId,
    title: { $regex: q, $options: "i" },
  };

  const collections = await Collections.find(searchCriteria)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const collectionsWithProductCount = await Promise.all(
    collections.map(async (collection) => {
      const productCount = await CollectionEntry.countDocuments({
        collectionId: collection._id,
      });

      return {
        ...collection,
        productCount,
      };
    })
  );

  const totalCollections = await Collections.countDocuments(searchCriteria);

  res.status(200).json({
    success: true,
    data: collectionsWithProductCount,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalCollections / Number(limit)),
      totalItems: totalCollections,
      itemsPerPage: Number(limit),
    },
  });
});

export const searchProductsInCollection = asyncErrorHandler(async (req: Request, res: Response) => {
  const { collectionId } = req.params;
  const { q, page = 1, limit = 10 } = req.query as Record<string, any>;

  if (!collectionId || !mongoose.isValidObjectId(collectionId)) {
    throw new CustomError("Valid collectionId is required", 400);
  }
  if (!q || typeof q !== "string") {
    throw new CustomError("Search query 'q' is required", 400);
  }

  const collection = await getCollectionOrThrow(collectionId);
  await assertStoreAccess(collection.storeId.toString(), req.user as SecureUserInfo | undefined);

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;
  const rx = new RegExp(q.trim(), "i");

  const productIds: mongoose.Types.ObjectId[] = await CollectionEntry.find({ collectionId })
    .distinct("productId");

  if (productIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      pagination: {
        currentPage: pageNum,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limitNum,
      },
    });
  }

  const filter = {
    _id: { $in: productIds },
    isDeleted: { $ne: true },
    $or: [{ title: rx }, { sku: rx }],
  } as any;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select({ title: 1, sku: 1, imageUrls: 1, vendor: 1, productType: 1, createdAt: 1 })
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
    },
  });
});
