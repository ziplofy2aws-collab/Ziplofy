import type {
  CreateStoreMenuItemInput,
  MenuItemLinkType,
  StoreMenuItem,
} from '../contexts/store-menu.context';

/** Local editor row before save (ContentMenuCreatePage). */
export type MenuItemDraft = {
  id: string;
  label: string;
  link: string;
  linkLabel?: string;
  linkType?: MenuItemLinkType;
  collectionId?: string;
  productId?: string;
};

export function menuItemDraftToApiInput(
  draft: MenuItemDraft,
  position: number
): CreateStoreMenuItemInput | null {
  const label = draft.label.trim();
  if (!label) return null;

  if (draft.linkType) {
    return {
      label,
      linkType: draft.linkType,
      link: draft.linkType === 'custom' ? draft.link.trim() : undefined,
      collectionId: draft.collectionId,
      productId: draft.productId,
      position,
    };
  }

  const link = draft.link.trim();

  if (link === '/') {
    return { label, linkType: 'homepage', position };
  }
  if (link === '/collections') {
    return { label, linkType: 'all-collections', position };
  }
  if (link === '/collections/all' || link === '/products') {
    return { label, linkType: 'all-products', position };
  }
  if (draft.collectionId) {
    return {
      label,
      linkType: 'specific-collection',
      collectionId: draft.collectionId,
      position,
    };
  }
  if (draft.productId) {
    return {
      label,
      linkType: 'specific-product',
      productId: draft.productId,
      position,
    };
  }
  if (!link) return null;

  return { label, linkType: 'custom', link, position };
}

export function storeMenuItemToDraft(item: StoreMenuItem): MenuItemDraft {
  let link = item.href || item.link || '';
  let linkLabel: string | undefined;

  if (item.linkType === 'specific-collection' && item.collection?.title) {
    linkLabel = item.collection.title;
  } else if (item.linkType === 'specific-product' && item.product?.title) {
    linkLabel = item.product.title;
  } else if (item.linkType === 'homepage') {
    link = '/';
    linkLabel = 'Home page';
  } else if (item.linkType === 'all-collections') {
    link = '/collections';
    linkLabel = 'All collections';
  } else if (item.linkType === 'all-products') {
    link = '/collections/all';
    linkLabel = 'All products';
  } else if (item.linkType === 'custom') {
    linkLabel = item.label;
  }

  return {
    id: item._id,
    label: item.label,
    link,
    linkLabel,
    linkType: item.linkType,
    collectionId: item.collectionId,
    productId: item.productId,
  };
}

export function menuItemDraftsToApiInputs(drafts: MenuItemDraft[]): CreateStoreMenuItemInput[] {
  const out: CreateStoreMenuItemInput[] = [];
  drafts.forEach((draft, index) => {
    const row = menuItemDraftToApiInput(draft, index);
    if (row) out.push(row);
  });
  return out;
}
