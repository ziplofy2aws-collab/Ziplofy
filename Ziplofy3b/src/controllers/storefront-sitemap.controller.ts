import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Collections } from '../models/collections/collections.model';
import { Product } from '../models/product/product.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { absoluteStorefrontUrl, buildSitemapXml, type SitemapUrlEntry } from '../utils/sitemap-xml.util';
import { resolveStoreFromRequest } from '../utils/storefront-host.util';

const PRODUCT_BATCH_SIZE = 500;
const MAX_SITEMAP_URLS = 50_000;

type ProductSitemapRow = {
  _id: mongoose.Types.ObjectId;
  updatedAt?: Date;
};

type CollectionSitemapRow = {
  urlHandle: string;
  updatedAt?: Date;
};

async function listActiveProductUrls(
  storeId: string,
  publicOrigin: string
): Promise<SitemapUrlEntry[]> {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const entries: SitemapUrlEntry[] = [];
  let skip = 0;

  while (entries.length < MAX_SITEMAP_URLS) {
    const batch = await Product.find({
      storeId: storeObjectId,
      status: 'active',
      isDeleted: { $ne: true },
      onlineStorePublishing: { $ne: false },
    })
      .select({ _id: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(PRODUCT_BATCH_SIZE)
      .lean<ProductSitemapRow[]>();

    if (!batch.length) break;

    for (const product of batch) {
      entries.push({
        loc: absoluteStorefrontUrl(publicOrigin, `/products/${String(product._id)}`),
        lastmod: product.updatedAt,
      });
      if (entries.length >= MAX_SITEMAP_URLS) break;
    }

    if (batch.length < PRODUCT_BATCH_SIZE) break;
    skip += PRODUCT_BATCH_SIZE;
  }

  return entries;
}

async function listPublishedCollectionUrls(
  storeId: string,
  publicOrigin: string
): Promise<SitemapUrlEntry[]> {
  const collections = await Collections.find({
    storeId,
    status: 'published',
    urlHandle: { $exists: true, $ne: '' },
  })
    .select({ urlHandle: 1, updatedAt: 1 })
    .sort({ updatedAt: -1 })
    .lean<CollectionSitemapRow[]>();

  return collections.map((collection) => ({
    loc: absoluteStorefrontUrl(
      publicOrigin,
      `/collections/${encodeURIComponent(collection.urlHandle.trim().toLowerCase())}`
    ),
    lastmod: collection.updatedAt,
  }));
}

function staticStorefrontUrls(publicOrigin: string): SitemapUrlEntry[] {
  return [
    { loc: absoluteStorefrontUrl(publicOrigin, '/') },
    { loc: absoluteStorefrontUrl(publicOrigin, '/collections') },
    { loc: absoluteStorefrontUrl(publicOrigin, '/collections/all') },
  ];
}

export const getStorefrontSitemap = asyncErrorHandler(async (req: Request, res: Response) => {
  const resolved = await resolveStoreFromRequest(req);
  if (!resolved) {
    throw new CustomError('Store not found for this hostname', 404);
  }

  const { storeId, publicOrigin } = resolved;
  const [productUrls, collectionUrls] = await Promise.all([
    listActiveProductUrls(storeId, publicOrigin),
    listPublishedCollectionUrls(storeId, publicOrigin),
  ]);

  const entries: SitemapUrlEntry[] = [
    ...staticStorefrontUrls(publicOrigin),
    ...collectionUrls,
    ...productUrls,
  ];

  const xml = buildSitemapXml(entries);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
});
