import type { InformaticPreviewPageId } from '@/components/informatic-theme-editor/InformaticLivePreview';
import { normalizeStorefrontOrigin } from '@/lib/storefront-url';
import {
  INFORMATIC_POLICY_PAGES,
  isInformaticPolicyTemplateId,
} from '@/lib/informatic-policy-pages';
import type { BlogPostPreviewSelection } from './blog-page-preview.util';
import type { CustomPagePreviewSelection } from './custom-page-preview.util';
import { buildStorefrontCustomPageUrl } from './custom-page-preview.util';

const PAGE_PATHS: Record<InformaticPreviewPageId, string> = {
  index: '/',
  about: '/about',
  features: '/features',
  pricing: '/pricing',
  blog_list: '/blog',
  blog_post: '/blog',
  page: '/',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  return_refund: '/return-refund',
  contact_info: '/contact-information',
  '404': '/404',
  search: '/search',
};

/**
 * Build a live storefront URL for the page currently selected in the theme editor.
 */
export function buildStorefrontPreviewUrl(
  origin: string | null | undefined,
  pageId: InformaticPreviewPageId,
  blogPostSelection?: BlogPostPreviewSelection | null,
  customPageSelection?: CustomPagePreviewSelection | null
): string | null {
  const base = normalizeStorefrontOrigin(origin);
  if (!base) return null;

  if (pageId === 'page') {
    const handle = customPageSelection?.urlHandle?.trim();
    return handle ? buildStorefrontCustomPageUrl(base, handle, true) : null;
  }

  if (isInformaticPolicyTemplateId(pageId)) {
    const route = INFORMATIC_POLICY_PAGES.find((p) => p.id === pageId)?.route;
    return route ? `${base}${route}` : null;
  }

  let path = PAGE_PATHS[pageId] ?? '/';

  if (pageId === 'blog_post') {
    const post = blogPostSelection?.postHandle?.trim();
    path = post ? `/blog/${encodeURIComponent(post)}` : '/blog';
  }

  return `${base}${path}`;
}
