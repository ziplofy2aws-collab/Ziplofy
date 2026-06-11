"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorefrontSitemap = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const collections_model_1 = require("../models/collections/collections.model");
const product_model_1 = require("../models/product/product.model");
const error_utils_1 = require("../utils/error.utils");
const sitemap_xml_util_1 = require("../utils/sitemap-xml.util");
const storefront_host_util_1 = require("../utils/storefront-host.util");
const PRODUCT_BATCH_SIZE = 500;
const MAX_SITEMAP_URLS = 50000;
async function listActiveProductUrls(storeId, publicOrigin) {
    const storeObjectId = new mongoose_1.default.Types.ObjectId(storeId);
    const entries = [];
    let skip = 0;
    while (entries.length < MAX_SITEMAP_URLS) {
        const batch = await product_model_1.Product.find({
            storeId: storeObjectId,
            status: 'active',
            isDeleted: { $ne: true },
            onlineStorePublishing: { $ne: false },
        })
            .select({ _id: 1, updatedAt: 1 })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(PRODUCT_BATCH_SIZE)
            .lean();
        if (!batch.length)
            break;
        for (const product of batch) {
            entries.push({
                loc: (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, `/products/${String(product._id)}`),
                lastmod: product.updatedAt,
            });
            if (entries.length >= MAX_SITEMAP_URLS)
                break;
        }
        if (batch.length < PRODUCT_BATCH_SIZE)
            break;
        skip += PRODUCT_BATCH_SIZE;
    }
    return entries;
}
async function listPublishedCollectionUrls(storeId, publicOrigin) {
    const collections = await collections_model_1.Collections.find({
        storeId,
        status: 'published',
        urlHandle: { $exists: true, $ne: '' },
    })
        .select({ urlHandle: 1, updatedAt: 1 })
        .sort({ updatedAt: -1 })
        .lean();
    return collections.map((collection) => ({
        loc: (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, `/collections/${encodeURIComponent(collection.urlHandle.trim().toLowerCase())}`),
        lastmod: collection.updatedAt,
    }));
}
function staticStorefrontUrls(publicOrigin) {
    return [
        { loc: (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, '/') },
        { loc: (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, '/collections') },
        { loc: (0, sitemap_xml_util_1.absoluteStorefrontUrl)(publicOrigin, '/collections/all') },
    ];
}
exports.getStorefrontSitemap = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const resolved = await (0, storefront_host_util_1.resolveStoreFromRequest)(req);
    if (!resolved) {
        throw new error_utils_1.CustomError('Store not found for this hostname', 404);
    }
    const { storeId, publicOrigin } = resolved;
    const [productUrls, collectionUrls] = await Promise.all([
        listActiveProductUrls(storeId, publicOrigin),
        listPublishedCollectionUrls(storeId, publicOrigin),
    ]);
    const entries = [
        ...staticStorefrontUrls(publicOrigin),
        ...collectionUrls,
        ...productUrls,
    ];
    const xml = (0, sitemap_xml_util_1.buildSitemapXml)(entries);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
});
