import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { Store } from "../models/store/store.model";
import { Product } from "../models/product/product.model";
import { Collections } from "../models/collections/collections.model";
import { CollectionEntry } from "../models/collection-entry/collection-entry.model";
import {
  isSafeLiquidTemplateName,
  resolveAppliedStoreTheme,
  resolveStorefrontLiquidRenderRoot,
  themeHasLiquidTemplates,
} from "../utils/storefront-liquid.util";
import { createStorefrontLiquid, renderLiquidThemePage } from "../services/theme-liquid/theme-liquid.renderer";
import {
  absolutizeImageUrlsArray,
  absolutizeMediaUrl,
  publicOriginFromRequest,
} from "../utils/public-origin.util";

function toLiquidProduct(p: Record<string, unknown>, publicOrigin: string) {
  const vendor = p.vendor as { name?: string } | undefined;
  const category = p.category as { name?: string } | undefined;
  const urls = absolutizeImageUrlsArray(publicOrigin, p.imageUrls);
  return {
    _id: String(p._id),
    handle: (p.urlHandle as string) || String(p._id),
    title: p.title,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice,
    image: urls[0] || "",
    images: urls,
    vendor: vendor?.name || "",
    category: category?.name || "",
    subtitle: (p.metaDescription as string) || "",
    rating: "4.8",
  };
}

function toLiquidCollection(c: Record<string, unknown>, publicOrigin: string) {
  return {
    _id: String(c._id),
    title: c.title,
    handle: c.urlHandle,
    image: absolutizeMediaUrl(publicOrigin, String(c.imageUrl || "")),
    description: c.description,
  };
}

export const renderStorefrontLiquidPage = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const {
    template = "index",
    collectionId,
    handle,
    slug,
  } = req.query as {
    template?: string;
    collectionId?: string;
    handle?: string;
    slug?: string;
  };

  if (!storeId) throw new CustomError("Store ID is required", 400);

  const resolved = await resolveAppliedStoreTheme(storeId);
  if (!resolved) {
    throw new CustomError("No applied theme for this store", 404);
  }

  const liquidRoots = await resolveStorefrontLiquidRenderRoot(storeId, resolved);
  if (!liquidRoots || !themeHasLiquidTemplates(liquidRoots.runtimeBaseDir)) {
    throw new CustomError("Theme does not support Liquid templates (missing templates/index.liquid)", 404);
  }

  const tpl = String(template || "index").trim().toLowerCase();
  if (!isSafeLiquidTemplateName(tpl)) {
    throw new CustomError("Invalid template name", 400);
  }
  const templateFile = path.join(liquidRoots.runtimeBaseDir, "templates", `${tpl}.liquid`);
  if (!fs.existsSync(templateFile)) {
    throw new CustomError(`Liquid template not found: templates/${tpl}.liquid`, 404);
  }

  const store = await Store.findById(storeId).lean();
  if (!store) throw new CustomError("Store not found", 404);

  /** Use explicit ObjectId so Product/Collection queries match stored refs (param is a string). */
  const storeObjectId = mongoose.isValidObjectId(storeId)
    ? new mongoose.Types.ObjectId(storeId)
    : null;
  if (!storeObjectId) throw new CustomError("Invalid store ID", 400);

  const publicOrigin = publicOriginFromRequest(req);

  const liquid = createStorefrontLiquid(liquidRoots.runtimeBaseDir, liquidRoots.runtimeBaseUrl);

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

  let collection: Record<string, unknown> | null = null;
  let products: Record<string, unknown>[] = [];
  let product: Record<string, unknown> | null = null;
  let collections: Record<string, unknown>[] = [];
  let articles: Record<string, unknown>[] = [];
  let article: Record<string, unknown> | null = null;

  if (tpl === "index") {
    // Same visibility as public product list: active, not deleted. (Default product status in DB is often "draft".)
    const [productRows, collectionRows] = await Promise.all([
      Product.find({
        storeId: storeObjectId,
        isDeleted: { $ne: true },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .limit(24)
        .populate({ path: "vendor", select: "name" })
        .populate({ path: "category", select: "name" })
        .lean(),
      Collections.find({ storeId: storeObjectId, status: "published" })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ]);
    products = productRows.map((p) => toLiquidProduct(p as Record<string, unknown>, publicOrigin));
    collections = collectionRows.map((c) => toLiquidCollection(c as Record<string, unknown>, publicOrigin));
  }

  if (tpl === "collection") {
    let col: Record<string, unknown> | null = null;
    if (collectionId && mongoose.isValidObjectId(collectionId)) {
      col = (await Collections.findOne({
        _id: collectionId,
        storeId: storeObjectId,
      }).lean()) as Record<string, unknown> | null;
    }
    if (!col && handle) {
      col = (await Collections.findOne({
        storeId: storeObjectId,
        urlHandle: handle,
      }).lean()) as Record<string, unknown> | null;
    }
    if (col) {
      collection = toLiquidCollection(col, publicOrigin);
      const productIds = await CollectionEntry.find({ collectionId: col._id }).distinct("productId");
      if (productIds.length) {
        const productRows = await Product.find({
          _id: { $in: productIds },
          isDeleted: { $ne: true },
        })
          .populate({ path: "vendor", select: "name" })
          .populate({ path: "category", select: "name" })
          .lean();
        const orderMap = new Map(productIds.map((id, i) => [String(id), i]));
        productRows.sort(
          (a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0)
        );
        products = productRows.map((p) => toLiquidProduct(p as Record<string, unknown>, publicOrigin));
      }
    } else {
      collection = {
        _id: "all",
        title: "All products",
        handle: "all",
        image: "",
        description: "",
      };
      const productRows = await Product.find({
        storeId: storeObjectId,
        isDeleted: { $ne: true },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .limit(48)
        .populate({ path: "vendor", select: "name" })
        .populate({ path: "category", select: "name" })
        .lean();
      products = productRows.map((p) => toLiquidProduct(p as Record<string, unknown>, publicOrigin));
    }
  }

  if (tpl === "product") {
    const h = handle || "";
    if (!h) throw new CustomError("handle (product id or url handle) is required", 400);

    let pdoc: Record<string, unknown> | null = null;
    if (mongoose.isValidObjectId(h)) {
      pdoc = (await Product.findOne({
        _id: h,
        storeId: storeObjectId,
        isDeleted: { $ne: true },
        status: "active",
      })
        .populate({ path: "vendor", select: "name" })
        .populate({ path: "category", select: "name" })
        .lean()) as Record<string, unknown> | null;
    }
    if (!pdoc) {
      pdoc = (await Product.findOne({
        storeId: storeObjectId,
        urlHandle: h,
        isDeleted: { $ne: true },
        status: "active",
      })
        .populate({ path: "vendor", select: "name" })
        .populate({ path: "category", select: "name" })
        .lean()) as Record<string, unknown> | null;
    }
    if (!pdoc) throw new CustomError("Product not found", 404);
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
      content:
        "<p>This article is a placeholder until blog content is connected to your store.</p>",
    };
  }

  const ancillaryTemplates = new Set(["blog", "blog-detail", "contact", "cart", "wishlist"]);
  if (ancillaryTemplates.has(tpl) && collections.length === 0) {
    const collectionRows = await Collections.find({ storeId: storeObjectId, status: "published" })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    collections = collectionRows.map((c) => toLiquidCollection(c as Record<string, unknown>, publicOrigin));
  }

  const pageTitleExtra: Record<string, string> = {
    blog: "Blog",
    "blog-detail": article ? String(article.title) : "Blog",
    contact: "Contact us",
    cart: "Cart",
    wishlist: "Wishlist",
  };

  const page = {
    title:
      tpl === "product" && product
        ? String(product.title)
        : pageTitleExtra[tpl] || store.storeName,
    hero_slides: [] as unknown[],
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

  const html = await renderLiquidThemePage(liquid, liquidRoots.runtimeBaseDir, tpl, context);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.send(html);
});
