import { Request, Response } from "express";
import mongoose from "mongoose";
import { StorePage } from "../models/store-page/store-page.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { slugifyMenuHandle } from "../utils/store-menu-link.util";

function isPreviewRequest(req: Request): boolean {
  const preview = req.query.preview;
  return preview === "1" || preview === "true";
}

function assertValidStoreId(storeId: string): void {
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
}

/** Candidate handles so menu links with underscores still match hyphenated urlHandles. */
function urlHandleCandidates(raw: string): string[] {
  const decoded = decodeURIComponent(raw.trim()).toLowerCase();
  const slugified = slugifyMenuHandle(decoded);
  const underscored = decoded.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const candidates = [decoded, slugified, underscored].filter(Boolean);
  return [...new Set(candidates)];
}

const STOREFRONT_PAGE_SELECT = {
  storeId: 1,
  title: 1,
  content: 1,
  pageTitle: 1,
  metaDescription: 1,
  urlHandle: 1,
  visibility: 1,
  themeTemplate: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

/** Storefront: list visible pages for a store (handles + titles). */
export const listPagesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  assertValidStoreId(storeId);

  const filter = isPreviewRequest(req)
    ? { storeId }
    : { storeId, visibility: "visible" as const };

  const pages = await StorePage.find(filter)
    .sort({ updatedAt: -1 })
    .select(STOREFRONT_PAGE_SELECT)
    .lean();

  res.status(200).json({
    success: true,
    data: pages,
    count: pages.length,
  });
});

/** Storefront: resolve a page by store + url handle (visible unless ?preview=1). */
export const getPageByUrlHandle = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, urlHandle } = req.params;
  assertValidStoreId(storeId);
  if (!urlHandle?.trim()) throw new CustomError("urlHandle is required", 400);

  const handles = urlHandleCandidates(urlHandle);
  const filter = {
    storeId,
    urlHandle: handles.length === 1 ? handles[0] : { $in: handles },
    ...(isPreviewRequest(req) ? {} : { visibility: "visible" as const }),
  };

  const page = await StorePage.findOne(filter).select(STOREFRONT_PAGE_SELECT).lean();
  if (!page) {
    throw new CustomError("Page not found", 404);
  }

  res.status(200).json({
    success: true,
    data: page,
  });
});

/** @deprecated Alias kept for older compiled route imports. */
export const getStorePageByUrlHandle = getPageByUrlHandle;
