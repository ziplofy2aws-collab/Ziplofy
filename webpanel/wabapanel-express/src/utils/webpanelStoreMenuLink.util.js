const { slugifyHandle } = require('./slug.util');

const FRONTEND_BASE = (process.env.FRONTEND_URL || 'http://localhost:3002').replace(/\/$/, '');

function resolveLeadGenFormPublicUrl(formId) {
  const id = String(formId || '').trim();
  if (!id) return `${FRONTEND_BASE}/form`;
  return `${FRONTEND_BASE}/form/${encodeURIComponent(id)}`;
}

function slugifyMenuHandle(menuName) {
  return slugifyHandle(menuName, 'menu');
}

function menuItemListSummaryLabel(linkType, label) {
  const trimmed = label?.trim();
  if (trimmed) return trimmed;
  switch (linkType) {
    case 'homepage':
      return 'Home page';
    case 'search':
      return 'Search';
    case 'all-blogs':
      return 'All blogs';
    case 'specific-page':
      return 'Page';
    case 'specific-blog':
      return 'Blog';
    case 'specific-blog-post':
      return 'Blog post';
    case 'lead-gen-form':
      return 'Lead gen form';
    case 'custom':
      return 'Custom link';
    default:
      return 'Link';
  }
}

function resolveStoreMenuItemHref(input) {
  const handle = (raw) => String(raw || '').trim().toLowerCase();

  switch (input.linkType) {
    case 'homepage':
      return '/';
    case 'search':
      return '/search';
    case 'all-blogs':
      return '/blogs';
    case 'specific-page': {
      const urlHandle = handle(input.page?.urlHandle);
      return urlHandle ? `/${urlHandle}` : '/';
    }
    case 'specific-blog': {
      const urlHandle = handle(input.blog?.urlHandle);
      return urlHandle ? `/blogs/${urlHandle}` : '/blogs';
    }
    case 'specific-blog-post': {
      const urlHandle = handle(input.blogPost?.urlHandle);
      return urlHandle ? `/blog/${urlHandle}` : '/blogs';
    }
    case 'lead-gen-form': {
      const formId = input.form?._id || input.formId;
      return resolveLeadGenFormPublicUrl(formId);
    }
    case 'custom':
      return String(input.link || '').trim() || '/';
    default:
      return String(input.link || '').trim() || '/';
  }
}

module.exports = {
  slugifyMenuHandle,
  menuItemListSummaryLabel,
  resolveStoreMenuItemHref,
  resolveLeadGenFormPublicUrl,
};
