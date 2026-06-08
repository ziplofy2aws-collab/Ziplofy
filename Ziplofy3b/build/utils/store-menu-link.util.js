"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStoreMenuItemHref = resolveStoreMenuItemHref;
exports.menuItemListSummaryLabel = menuItemListSummaryLabel;
exports.slugifyMenuHandle = slugifyMenuHandle;
/** Resolve storefront href from linkType + populated refs (url handles may change). */
function resolveStoreMenuItemHref(input) {
    const handle = (raw) => raw?.trim().toLowerCase() || "";
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
function menuItemListSummaryLabel(linkType, label) {
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
function slugifyMenuHandle(menuName) {
    const slug = menuName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || "menu";
}
