import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  StorePage,
  STORE_PAGE_VISIBILITIES,
  type StorePageVisibility,
} from "../models/store-page/store-page.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { slugifyMenuHandle } from "../utils/store-menu-link.util";

function normalizeUrlHandle(raw: unknown, title: string): string {
  const supplied = typeof raw === "string" ? raw.trim() : "";
  const handle = (supplied || slugifyMenuHandle(title)).toLowerCase();
  if (!handle || !/^[a-z0-9-]+$/.test(handle)) {
    throw new CustomError("Valid URL handle is required", 400);
  }
  return handle;
}

function normalizeVisibility(value: unknown): StorePageVisibility {
  if (
    typeof value === "string" &&
    STORE_PAGE_VISIBILITIES.includes(value as StorePageVisibility)
  ) {
    return value as StorePageVisibility;
  }
  return "hidden";
}

function normalizeThemeTemplate(value: unknown): string {
  if (value === undefined || value === null || value === "") return "default";
  if (typeof value !== "string") throw new CustomError("Invalid themeTemplate value", 400);
  const normalized = value.trim().toLowerCase();
  if (!/^(default|pages(?:\.[a-z][a-z0-9_-]*)?)$/.test(normalized)) {
    throw new CustomError("Invalid themeTemplate value", 400);
  }
  return normalized;
}

export const createStorePage = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    title,
    content,
    pageTitle,
    metaDescription,
    urlHandle,
    visibility,
    themeTemplate,
  } = req.body;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (typeof title !== "string" || !title.trim()) {
    throw new CustomError("title is required", 400);
  }

  const trimmedTitle = title.trim();
  const handle = normalizeUrlHandle(urlHandle, trimmedTitle);
  const duplicate = await StorePage.findOne({ storeId, urlHandle: handle }).select("_id").lean();
  if (duplicate) {
    throw new CustomError("A page with this URL handle already exists for this store", 409);
  }

  const page = await StorePage.create({
    storeId,
    title: trimmedTitle,
    content: typeof content === "string" ? content : "",
    pageTitle: typeof pageTitle === "string" ? pageTitle.trim() : "",
    metaDescription: typeof metaDescription === "string" ? metaDescription.trim() : "",
    urlHandle: handle,
    visibility: normalizeVisibility(visibility),
    themeTemplate: normalizeThemeTemplate(themeTemplate),
  });

  res.status(201).json({
    success: true,
    data: page,
    message: "Page created successfully",
  });
});

export const getStorePagesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const pages = await StorePage.find({ storeId }).sort({ updatedAt: -1 }).lean();
  res.status(200).json({ success: true, data: pages, count: pages.length });
});

export const getStorePageById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid page id is required", 400);
  }

  const page = await StorePage.findById(id).lean();
  if (!page) throw new CustomError("Page not found", 404);

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(page.storeId) !== String(storeId)) {
      throw new CustomError("Page does not belong to this store", 403);
    }
  }

  res.status(200).json({ success: true, data: page });
});

export const updateStorePage = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid page id is required", 400);
  }

  const existing = await StorePage.findById(id);
  if (!existing) throw new CustomError("Page not found", 404);

  const { storeId, title, content, pageTitle, metaDescription, urlHandle, visibility, themeTemplate } =
    req.body;

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(existing.storeId) !== String(storeId)) {
      throw new CustomError("Page does not belong to this store", 403);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new CustomError("title cannot be empty", 400);
    }
    updateData.title = title.trim();
  }
  if (content !== undefined) updateData.content = typeof content === "string" ? content : "";
  if (pageTitle !== undefined) {
    updateData.pageTitle = typeof pageTitle === "string" ? pageTitle.trim() : "";
  }
  if (metaDescription !== undefined) {
    updateData.metaDescription =
      typeof metaDescription === "string" ? metaDescription.trim() : "";
  }
  if (visibility !== undefined) {
    if (
      typeof visibility !== "string" ||
      !STORE_PAGE_VISIBILITIES.includes(visibility as StorePageVisibility)
    ) {
      throw new CustomError("Invalid visibility value", 400);
    }
    updateData.visibility = visibility;
  }
  if (themeTemplate !== undefined) {
    updateData.themeTemplate = normalizeThemeTemplate(themeTemplate);
  }

  if (urlHandle !== undefined || title !== undefined) {
    const nextTitle = (updateData.title as string | undefined) ?? existing.title;
    const handle = normalizeUrlHandle(
      urlHandle !== undefined ? urlHandle : existing.urlHandle,
      nextTitle
    );
    const duplicate = await StorePage.findOne({
      storeId: existing.storeId,
      urlHandle: handle,
      _id: { $ne: existing._id },
    })
      .select("_id")
      .lean();
    if (duplicate) {
      throw new CustomError("A page with this URL handle already exists for this store", 409);
    }
    updateData.urlHandle = handle;
  }

  const page = await StorePage.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: page,
    message: "Page updated successfully",
  });
});

export const deleteStorePage = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid page id is required", 400);
  }

  const page = await StorePage.findById(id);
  if (!page) throw new CustomError("Page not found", 404);

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(page.storeId) !== String(storeId)) {
      throw new CustomError("Page does not belong to this store", 403);
    }
  }

  await page.deleteOne();
  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Page deleted successfully",
  });
});
