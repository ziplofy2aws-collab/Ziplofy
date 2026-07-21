import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import { StoreMenu, IStoreMenu } from "../models/store-menu/store-menu.model";
import {
  StoreMenuItem,
  IStoreMenuItem,
  MENU_ITEM_LINK_TYPES,
  type MenuItemLinkType,
} from "../models/store-menu-item/store-menu-item.model";
import { Collections } from "../models/collections/collections.model";
import { Product } from "../models/product/product.model";
import {
  menuItemListSummaryLabel,
  resolveStoreMenuItemHref,
  slugifyMenuHandle,
} from "../utils/store-menu-link.util";

type MenuItemInput = {
  label: string;
  linkType: MenuItemLinkType;
  link?: string;
  collectionId?: string;
  productId?: string;
  position?: number;
};

type CreateMenuBody = {
  storeId: string;
  menuName: string;
  handle?: string;
  items?: MenuItemInput[];
};

type UpdateMenuBody = {
  menuName?: string;
  handle?: string;
  items?: MenuItemInput[];
};

async function assertMenuBelongsToStore(menuId: string, storeId: string): Promise<IStoreMenu & { _id: mongoose.Types.ObjectId }> {
  if (!mongoose.isValidObjectId(menuId)) {
    throw new CustomError("Valid menu id is required", 400);
  }
  const menu = await StoreMenu.findById(menuId).lean();
  if (!menu) throw new CustomError("Menu not found", 404);
  if (String(menu.storeId) !== String(storeId)) {
    throw new CustomError("Menu does not belong to this store", 403);
  }
  return menu as IStoreMenu & { _id: mongoose.Types.ObjectId };
}

async function validateAndNormalizeMenuItems(
  storeId: string,
  items: MenuItemInput[]
): Promise<
  Array<{
    label: string;
    linkType: MenuItemLinkType;
    link?: string;
    collectionId?: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    position: number;
  }>
> {
  if (!Array.isArray(items)) {
    throw new CustomError("items must be an array", 400);
  }

  const normalized = [];

  for (let index = 0; index < items.length; index++) {
    const row = items[index];
    const label = row?.label?.trim();
    const linkType = row?.linkType;

    if (!label) throw new CustomError(`Item at index ${index}: label is required`, 400);
    if (!linkType || !MENU_ITEM_LINK_TYPES.includes(linkType)) {
      throw new CustomError(`Item at index ${index}: invalid linkType`, 400);
    }

    const position = typeof row.position === "number" && row.position >= 0 ? row.position : index;

    if (linkType === "specific-collection") {
      const collectionId = row.collectionId;
      if (!collectionId || !mongoose.isValidObjectId(collectionId)) {
        throw new CustomError(`Item at index ${index}: collectionId is required for specific-collection`, 400);
      }
      const collection = await Collections.findOne({ _id: collectionId, storeId }).select("_id").lean();
      if (!collection) {
        throw new CustomError(`Item at index ${index}: collection not found for this store`, 400);
      }
      normalized.push({
        label,
        linkType,
        collectionId: new mongoose.Types.ObjectId(collectionId),
        position,
      });
      continue;
    }

    if (linkType === "specific-product") {
      const productId = row.productId;
      if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new CustomError(`Item at index ${index}: productId is required for specific-product`, 400);
      }
      const product = await Product.findOne({
        _id: productId,
        storeId,
        isDeleted: { $ne: true },
      })
        .select("_id")
        .lean();
      if (!product) {
        throw new CustomError(`Item at index ${index}: product not found for this store`, 400);
      }
      normalized.push({
        label,
        linkType,
        productId: new mongoose.Types.ObjectId(productId),
        position,
      });
      continue;
    }

    if (linkType === "custom") {
      const link = row.link?.trim();
      if (!link) {
        throw new CustomError(`Item at index ${index}: link is required for custom`, 400);
      }
      normalized.push({ label, linkType, link, position });
      continue;
    }

    normalized.push({ label, linkType, position });
  }

  return normalized;
}

async function enrichMenuItemsWithHref(items: IStoreMenuItem[]) {
  const collectionIds = items
    .filter((i) => i.linkType === "specific-collection" && i.collectionId)
    .map((i) => i.collectionId!);
  const productIds = items
    .filter((i) => i.linkType === "specific-product" && i.productId)
    .map((i) => i.productId!);

  const [collections, products] = await Promise.all([
    collectionIds.length
      ? Collections.find({ _id: { $in: collectionIds } }).select("_id urlHandle title").lean()
      : [],
    productIds.length
      ? Product.find({ _id: { $in: productIds } }).select("_id urlHandle title").lean()
      : [],
  ]);

  const collectionById = new Map(collections.map((c) => [String(c._id), c]));
  const productById = new Map(products.map((p) => [String(p._id), p]));

  return items.map((item) => {
    const collection =
      item.linkType === "specific-collection" && item.collectionId
        ? collectionById.get(String(item.collectionId)) ?? null
        : null;
    const product =
      item.linkType === "specific-product" && item.productId
        ? productById.get(String(item.productId)) ?? null
        : null;

    return {
      ...item,
      href: resolveStoreMenuItemHref({
        linkType: item.linkType,
        link: item.link,
        collectionId: collection,
        productId: product,
      }),
      collection: collection ?? undefined,
      product: product ?? undefined,
    };
  });
}

export const createStoreMenu = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, menuName, handle: handleRaw, items = [] } = req.body as CreateMenuBody;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (!menuName?.trim()) {
    throw new CustomError("menuName is required", 400);
  }

  const handle = (handleRaw?.trim() || slugifyMenuHandle(menuName)).toLowerCase();
  const normalizedItems = await validateAndNormalizeMenuItems(storeId, items);

  const existing = await StoreMenu.findOne({ storeId, handle }).select("_id").lean();
  if (existing) {
    throw new CustomError("A menu with this handle already exists for this store", 409);
  }

  const session = await mongoose.startSession();
  let menu!: IStoreMenu & { _id: mongoose.Types.ObjectId };

  try {
    await session.withTransaction(async () => {
      const created = await StoreMenu.create(
        [{ storeId, menuName: menuName.trim(), handle }],
        { session }
      );
      menu = created[0] as IStoreMenu & { _id: mongoose.Types.ObjectId };

      if (normalizedItems.length > 0) {
        await StoreMenuItem.insertMany(
          normalizedItems.map((item) => ({
            menuId: menu._id,
            ...item,
          })),
          { session, ordered: true }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const savedItems = await StoreMenuItem.find({ menuId: menu._id }).sort({ position: 1 }).lean();
  const enrichedItems = await enrichMenuItemsWithHref(savedItems as IStoreMenuItem[]);

  res.status(201).json({
    success: true,
    data: { menu, items: enrichedItems },
    message: "Menu created successfully",
  });
});

export const getStoreMenusByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const menus = await StoreMenu.find({ storeId }).sort({ createdAt: -1 }).lean();
  const menuIds = menus.map((m) => m._id);

  const items =
    menuIds.length > 0
      ? await StoreMenuItem.find({ menuId: { $in: menuIds } })
          .sort({ position: 1 })
          .select("menuId label linkType")
          .lean()
      : [];

  const labelsByMenuId = new Map<string, string[]>();
  for (const item of items) {
    const key = String(item.menuId);
    if (!labelsByMenuId.has(key)) labelsByMenuId.set(key, []);
    labelsByMenuId
      .get(key)!
      .push(menuItemListSummaryLabel(item.linkType as MenuItemLinkType, item.label));
  }

  const data = menus.map((menu) => {
    const itemLabels = labelsByMenuId.get(String(menu._id)) ?? [];
    return {
      ...menu,
      itemLabels,
      menuItemsSummary: itemLabels.join(", "),
    };
  });

  res.status(200).json({ success: true, data, count: data.length });
});

export const getStoreMenuById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid menu id is required", 400);
  }

  const menu = await StoreMenu.findById(id).lean();
  if (!menu) throw new CustomError("Menu not found", 404);

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(menu.storeId) !== String(storeId)) {
      throw new CustomError("Menu does not belong to this store", 403);
    }
  }

  const items = await StoreMenuItem.find({ menuId: id }).sort({ position: 1 }).lean();
  const enrichedItems = await enrichMenuItemsWithHref(items as IStoreMenuItem[]);

  res.status(200).json({
    success: true,
    data: { menu, items: enrichedItems },
  });
});

export const getStoreMenuItemsByMenuId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { menuId } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(menuId)) {
    throw new CustomError("Valid menuId is required", 400);
  }

  const menu = await StoreMenu.findById(menuId).lean();
  if (!menu) throw new CustomError("Menu not found", 404);

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    if (String(menu.storeId) !== String(storeId)) {
      throw new CustomError("Menu does not belong to this store", 403);
    }
  }

  const items = await StoreMenuItem.find({ menuId }).sort({ position: 1 }).lean();
  const enrichedItems = await enrichMenuItemsWithHref(items as IStoreMenuItem[]);

  res.status(200).json({ success: true, data: enrichedItems, count: enrichedItems.length });
});

export const updateStoreMenu = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { menuName, handle: handleRaw, items } = req.body as UpdateMenuBody;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid menu id is required", 400);
  }

  const menu = await StoreMenu.findById(id);
  if (!menu) throw new CustomError("Menu not found", 404);

  if (menuName?.trim()) menu.menuName = menuName.trim();
  if (handleRaw?.trim()) menu.handle = handleRaw.trim().toLowerCase();

  if (menu.isModified("menuName") && !handleRaw?.trim()) {
    menu.handle = slugifyMenuHandle(menu.menuName);
  }

  if (menu.isModified("handle")) {
    const conflict = await StoreMenu.findOne({
      storeId: menu.storeId,
      handle: menu.handle,
      _id: { $ne: menu._id },
    })
      .select("_id")
      .lean();
    if (conflict) {
      throw new CustomError("A menu with this handle already exists for this store", 409);
    }
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await menu.save({ session });

      if (Array.isArray(items)) {
        const normalizedItems = await validateAndNormalizeMenuItems(String(menu.storeId), items);
        await StoreMenuItem.deleteMany({ menuId: menu._id }, { session });
        if (normalizedItems.length > 0) {
          await StoreMenuItem.insertMany(
            normalizedItems.map((item) => ({
              menuId: menu._id,
              ...item,
            })),
            { session, ordered: true }
          );
        }
      }
    });
  } finally {
    await session.endSession();
  }

  const savedItems = await StoreMenuItem.find({ menuId: menu._id }).sort({ position: 1 }).lean();
  const enrichedItems = await enrichMenuItemsWithHref(savedItems as IStoreMenuItem[]);

  res.status(200).json({
    success: true,
    data: { menu: menu.toObject(), items: enrichedItems },
    message: "Menu updated successfully",
  });
});

export const deleteStoreMenu = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid menu id is required", 400);
  }

  const menu = await StoreMenu.findById(id);
  if (!menu) throw new CustomError("Menu not found", 404);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await StoreMenuItem.deleteMany({ menuId: menu._id }, { session });
      await menu.deleteOne({ session });
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Menu deleted successfully",
  });
});

export const createStoreMenuItem = asyncErrorHandler(async (req: Request, res: Response) => {
  const { menuId } = req.params;
  const { storeId, ...itemBody } = req.body as MenuItemInput & { storeId: string };

  if (!mongoose.isValidObjectId(menuId)) {
    throw new CustomError("Valid menuId is required", 400);
  }
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  await assertMenuBelongsToStore(menuId, storeId);

  const [normalized] = await validateAndNormalizeMenuItems(storeId, [itemBody]);
  const created = await StoreMenuItem.create({
    menuId,
    ...normalized,
  });

  const [enriched] = await enrichMenuItemsWithHref([created.toObject() as IStoreMenuItem]);

  res.status(201).json({
    success: true,
    data: enriched,
    message: "Menu item created successfully",
  });
});

export const updateStoreMenuItem = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, ...itemBody } = req.body as Partial<MenuItemInput> & { storeId: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid menu item id is required", 400);
  }
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const existing = await StoreMenuItem.findById(id);
  if (!existing) throw new CustomError("Menu item not found", 404);

  await assertMenuBelongsToStore(String(existing.menuId), storeId);

  const merged: MenuItemInput = {
    label: itemBody.label ?? existing.label,
    linkType: itemBody.linkType ?? existing.linkType,
    link: itemBody.link ?? existing.link,
    collectionId: itemBody.collectionId ?? (existing.collectionId ? String(existing.collectionId) : undefined),
    productId: itemBody.productId ?? (existing.productId ? String(existing.productId) : undefined),
    position: itemBody.position ?? existing.position,
  };

  const [normalized] = await validateAndNormalizeMenuItems(storeId, [merged]);

  existing.label = normalized.label;
  existing.linkType = normalized.linkType;
  existing.link = normalized.link;
  existing.collectionId = normalized.collectionId;
  existing.productId = normalized.productId;
  existing.position = normalized.position;
  await existing.save();

  const [enriched] = await enrichMenuItemsWithHref([existing.toObject() as IStoreMenuItem]);

  res.status(200).json({
    success: true,
    data: enriched,
    message: "Menu item updated successfully",
  });
});

export const deleteStoreMenuItem = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid menu item id is required", 400);
  }

  const item = await StoreMenuItem.findById(id);
  if (!item) throw new CustomError("Menu item not found", 404);

  if (storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError("Valid storeId is required", 400);
    }
    await assertMenuBelongsToStore(String(item.menuId), storeId);
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Menu item deleted successfully",
  });
});
