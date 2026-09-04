import type { CreateMenuItemInput, MenuItemLinkType, StoreMenuItem } from '@/lib/store-menu';

export type MenuItemDraft = {
  id: string;
  label: string;
  link: string;
  linkLabel?: string;
  linkType?: MenuItemLinkType;
  pageId?: string;
  blogId?: string;
  blogPostId?: string;
  formId?: string;
};

export function createMenuItemDraft(): MenuItemDraft {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: '',
    link: '',
  };
}

export function menuItemDraftToApiInput(draft: MenuItemDraft, position: number): CreateMenuItemInput | null {
  const label = draft.label.trim();
  if (!label) return null;

  if (draft.linkType) {
    return {
      label,
      linkType: draft.linkType,
      link: draft.linkType === 'custom' ? draft.link.trim() : undefined,
      pageId: draft.pageId,
      blogId: draft.blogId,
      blogPostId: draft.blogPostId,
      formId: draft.formId,
      position,
    };
  }

  const link = draft.link.trim();
  if (link === '/') return { label, linkType: 'homepage', position };
  if (link === '/search') return { label, linkType: 'search', position };
  if (link === '/blogs' || link === '/blogs/all') return { label, linkType: 'all-blogs', position };
  if (draft.pageId) return { label, linkType: 'specific-page', pageId: draft.pageId, position };
  if (draft.blogId) return { label, linkType: 'specific-blog', blogId: draft.blogId, position };
  if (draft.blogPostId) return { label, linkType: 'specific-blog-post', blogPostId: draft.blogPostId, position };
  if (draft.formId) return { label, linkType: 'lead-gen-form', formId: draft.formId, position };
  if (!link) return null;
  return { label, linkType: 'custom', link, position };
}

export function storeMenuItemToDraft(item: StoreMenuItem): MenuItemDraft {
  let link = item.href || item.link || '';
  let linkLabel: string | undefined;

  if (item.linkType === 'specific-page' && item.page?.title) linkLabel = item.page.title;
  else if (item.linkType === 'specific-blog' && item.blog?.title) linkLabel = item.blog.title;
  else if (item.linkType === 'specific-blog-post' && item.blogPost?.title) linkLabel = item.blogPost.title;
  else if (item.linkType === 'lead-gen-form' && item.form?.name) linkLabel = item.form.name;
  else if (item.linkType === 'homepage') {
    link = '/';
    linkLabel = 'Home page';
  } else if (item.linkType === 'search') {
    link = '/search';
    linkLabel = 'Search';
  } else if (item.linkType === 'all-blogs') {
    link = '/blogs';
    linkLabel = 'All blogs';
  }

  return {
    id: item._id,
    label: item.label,
    link,
    linkLabel,
    linkType: item.linkType,
    pageId: item.pageId,
    blogId: item.blogId,
    blogPostId: item.blogPostId,
    formId: item.formId,
  };
}

export function menuItemDraftsToApiInputs(drafts: MenuItemDraft[]): CreateMenuItemInput[] {
  const out: CreateMenuItemInput[] = [];
  drafts.forEach((draft, index) => {
    const row = menuItemDraftToApiInput(draft, index);
    if (row) out.push(row);
  });
  return out;
}
