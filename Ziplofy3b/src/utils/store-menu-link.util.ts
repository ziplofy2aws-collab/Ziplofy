import type { MenuItemLinkType } from "../models/store-menu-item/store-menu-item.model";

export type MenuLinkResolveInput = {
  linkType: MenuItemLinkType;
  link?: string;
  collectionId?: { urlHandle?: string } | null;
  productId?: { urlHandle?: string } | null;
};

/** Resolve storefront href from linkType + populated refs (url handles may change). */
export function resolveStoreMenuItemHref(input: MenuLinkResolveInput): string {
  const handle = (raw?: string) => raw?.trim().toLowerCase() || "";

  switch (input.linkType) {
    case "homepage":
      return "/";
    case "all-collections":
      return "/collections";
    case "all-products":
      return "/collections/all";
    case "specific-collection": {
      const urlHandle = handle(input.collectionId?.urlHandle);
      return urlHandle ? `/collections/${urlHandle}` : "/collections";
    }
    case "specific-product": {
      const urlHandle = handle(input.productId?.urlHandle);
      return urlHandle ? `/products/${urlHandle}` : "/products";
    }
    case "custom":
      return input.link?.trim() || "/";
    default:
      return input.link?.trim() || "/";
  }
}

/** Short label for admin menu list (Shopify-style comma-separated summary). */
export function menuItemListSummaryLabel(linkType: MenuItemLinkType, label?: string): string {
  const trimmed = label?.trim();
  switch (linkType) {
    case "homepage":
      return "Home page";
    case "all-collections":
      return "collections";
    case "all-products":
      return "products";
    case "specific-collection":
      return trimmed || "specific-collection";
    case "specific-product":
      return trimmed || "specific-product";
    case "custom":
      return trimmed || "custom";
    default:
      return trimmed || linkType;
  }
}

export function slugifyMenuHandle(menuName: string): string {
  const slug = menuName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "menu";
}
