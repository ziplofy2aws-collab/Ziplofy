"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderStorefrontLiquidPage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const store_model_1 = require("../models/store/store.model");
const product_model_1 = require("../models/product/product.model");
const collections_model_1 = require("../models/collections/collections.model");
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const storefront_liquid_util_1 = require("../utils/storefront-liquid.util");
const theme_liquid_renderer_1 = require("../services/theme-liquid/theme-liquid.renderer");
const public_origin_util_1 = require("../utils/public-origin.util");
function toLiquidProduct(p, publicOrigin) {
    const vendor = p.vendor;
    const category = p.category;
    const urls = (0, public_origin_util_1.absolutizeImageUrlsArray)(publicOrigin, p.imageUrls);
    return {
        _id: String(p._id),
        handle: p.urlHandle || String(p._id),
        title: p.title,
        description: p.description,
        price: p.price,
        compare_at_price: p.compareAtPrice,
        image: urls[0] || "",
        images: urls,
        vendor: vendor?.name || "",
        category: category?.name || "",
        subtitle: p.metaDescription || "",
        rating: "4.8",
    };
}
function toLiquidCollection(c, publicOrigin) {
    return {
        _id: String(c._id),
        title: c.title,
        handle: c.urlHandle,
        image: (0, public_origin_util_1.absolutizeMediaUrl)(publicOrigin, String(c.imageUrl || "")),
        description: c.description,
    };
}
exports.renderStorefrontLiquidPage = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { template = "index", collectionId, handle, slug, } = req.query;
    if (!storeId)
        throw new error_utils_1.CustomError("Store ID is required", 400);
    const resolved = await (0, storefront_liquid_util_1.resolveAppliedStoreTheme)(storeId);
    if (!resolved) {
        throw new error_utils_1.CustomError("No applied theme for this store", 404);
    }
    const liquidRoots = await (0, storefront_liquid_util_1.resolveStorefrontLiquidRenderRoot)(storeId, resolved);
    if (!liquidRoots || !(0, storefront_liquid_util_1.themeHasLiquidTemplates)(liquidRoots.runtimeBaseDir)) {
        throw new error_utils_1.CustomError("Theme does not support Liquid templates (missing templates/index.liquid)", 404);
    }
    const tpl = String(template || "index").trim().toLowerCase();
    if (!(0, storefront_liquid_util_1.isSafeLiquidTemplateName)(tpl)) {
        throw new error_utils_1.CustomError("Invalid template name", 400);
    }
    const templateFile = path_1.default.join(liquidRoots.runtimeBaseDir, "templates", `${tpl}.liquid`);
    if (!fs_1.default.existsSync(templateFile)) {
        throw new error_utils_1.CustomError(`Liquid template not found: templates/${tpl}.liquid`, 404);
    }
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store)
        throw new error_utils_1.CustomError("Store not found", 404);
    /** Use explicit ObjectId so Product/Collection queries match stored refs (param is a string). */
    const storeObjectId = mongoose_1.default.isValidObjectId(storeId)
        ? new mongoose_1.default.Types.ObjectId(storeId)
        : null;
    if (!storeObjectId)
        throw new error_utils_1.CustomError("Invalid store ID", 400);
    const publicOrigin = (0, public_origin_util_1.publicOriginFromRequest)(req);
    const liquid = (0, theme_liquid_renderer_1.createStorefrontLiquid)(liquidRoots.runtimeBaseDir, liquidRoots.runtimeBaseUrl);
    const menu = {
        primary: [
            { label: "Home", url: "/" },
            { label: "Products", url: "/products" },
            { label: "Collections", url: "/collection" },
            { label: "Blog", url: "/blog" },
            { label: "Contact", url: "/contact" },
        ],
    };
    const storePayload = {
        name: store.storeName,
        description: store.storeDescription,
        _id: String(store._id),
        search_placeholder: "Search products…",
        footer_newsletter_title: "Stay connected",
        footer_newsletter_placeholder: "Enter your email",
        footer_newsletter_text: "Get offers and updates.",
    };
    let collection = null;
    let products = [];
    let product = null;
    let collections = [];
    let articles = [];
    let article = null;
    if (tpl === "index") {
        // Same visibility as public product list: active, not deleted. (Default product status in DB is often "draft".)
        const [productRows, collectionRows] = await Promise.all([
            product_model_1.Product.find({
                storeId: storeObjectId,
                isDeleted: { $ne: true },
                status: "active",
            })
                .sort({ createdAt: -1 })
                .limit(24)
                .populate({ path: "vendor", select: "name" })
                .populate({ path: "category", select: "name" })
                .lean(),
            collections_model_1.Collections.find({ storeId: storeObjectId, status: "published" })
                .sort({ createdAt: -1 })
                .limit(12)
                .lean(),
        ]);
        products = productRows.map((p) => toLiquidProduct(p, publicOrigin));
        collections = collectionRows.map((c) => toLiquidCollection(c, publicOrigin));
    }
    if (tpl === "collection") {
        let col = null;
        if (collectionId && mongoose_1.default.isValidObjectId(collectionId)) {
            col = (await collections_model_1.Collections.findOne({
                _id: collectionId,
                storeId: storeObjectId,
            }).lean());
        }
        if (!col && handle) {
            col = (await collections_model_1.Collections.findOne({
                storeId: storeObjectId,
                urlHandle: handle,
            }).lean());
        }
        if (col) {
            collection = toLiquidCollection(col, publicOrigin);
            const productIds = await collection_entry_model_1.CollectionEntry.find({ collectionId: col._id }).distinct("productId");
            if (productIds.length) {
                const productRows = await product_model_1.Product.find({
                    _id: { $in: productIds },
                    isDeleted: { $ne: true },
                })
                    .populate({ path: "vendor", select: "name" })
                    .populate({ path: "category", select: "name" })
                    .lean();
                const orderMap = new Map(productIds.map((id, i) => [String(id), i]));
                productRows.sort((a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));
                products = productRows.map((p) => toLiquidProduct(p, publicOrigin));
            }
        }
        else {
            collection = {
                _id: "all",
                title: "All products",
                handle: "all",
                image: "",
                description: "",
            };
            const productRows = await product_model_1.Product.find({
                storeId: storeObjectId,
                isDeleted: { $ne: true },
                status: "active",
            })
                .sort({ createdAt: -1 })
                .limit(48)
                .populate({ path: "vendor", select: "name" })
                .populate({ path: "category", select: "name" })
                .lean();
            products = productRows.map((p) => toLiquidProduct(p, publicOrigin));
        }
    }
    if (tpl === "product") {
        const h = handle || "";
        if (!h)
            throw new error_utils_1.CustomError("handle (product id or url handle) is required", 400);
        let pdoc = null;
        if (mongoose_1.default.isValidObjectId(h)) {
            pdoc = (await product_model_1.Product.findOne({
                _id: h,
                storeId: storeObjectId,
                isDeleted: { $ne: true },
                status: "active",
            })
                .populate({ path: "vendor", select: "name" })
                .populate({ path: "category", select: "name" })
                .lean());
        }
        if (!pdoc) {
            pdoc = (await product_model_1.Product.findOne({
                storeId: storeObjectId,
                urlHandle: h,
                isDeleted: { $ne: true },
                status: "active",
            })
                .populate({ path: "vendor", select: "name" })
                .populate({ path: "category", select: "name" })
                .lean());
        }
        if (!pdoc)
            throw new error_utils_1.CustomError("Product not found", 404);
        product = toLiquidProduct(pdoc, publicOrigin);
    }
    const slugStr = typeof slug === "string" ? slug.trim() : "";
    if (tpl === "blog-detail" && slugStr) {
        const title = slugStr
            .split(/[-_]/)
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        article = {
            title: title || slugStr,
            handle: slugStr,
            content: "<p>This article is a placeholder until blog content is connected to your store.</p>",
        };
    }
    const ancillaryTemplates = new Set(["blog", "blog-detail", "contact", "cart", "wishlist"]);
    if (ancillaryTemplates.has(tpl) && collections.length === 0) {
        const collectionRows = await collections_model_1.Collections.find({ storeId: storeObjectId, status: "published" })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();
        collections = collectionRows.map((c) => toLiquidCollection(c, publicOrigin));
    }
    const pageTitleExtra = {
        blog: "Blog",
        "blog-detail": article ? String(article.title) : "Blog",
        contact: "Contact us",
        cart: "Cart",
        wishlist: "Wishlist",
    };
    const page = {
        title: tpl === "product" && product
            ? String(product.title)
            : pageTitleExtra[tpl] || store.storeName,
        hero_slides: [],
        hero_image: "",
        hero_badge: "New",
        hero_title: store.storeName,
        hero_price_text: "",
        hero_cta_url: "/products",
        hero_cta_label: "Shop now",
    };
    const context = {
        store: storePayload,
        menu,
        page,
        products,
        product,
        collection,
        collections,
        articles,
        article,
        section: { settings: {} },
    };
    const html = await (0, theme_liquid_renderer_1.renderLiquidThemePage)(liquid, liquidRoots.runtimeBaseDir, tpl, context);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(html);
});
