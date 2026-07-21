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
      return urlHandle ? `/collection/${urlHandle}` : "/collections";
    }
    case "specific-product": {
      const urlHandle = handle(input.productId?.urlHandle);
      return urlHandle ? `/product/${urlHandle}` : "/collections/all";
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
  if (trimmed) return trimmed;
  switch (linkType) {
    case "homepage":
      return "Home page";
    case "all-collections":
      return "Collections";
    case "all-products":
      return "Products";
    case "specific-collection":
      return "Collection";
    case "specific-product":
      return "Product";
    case "custom":
      return "Custom link";
    default:
      return "Link";
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
