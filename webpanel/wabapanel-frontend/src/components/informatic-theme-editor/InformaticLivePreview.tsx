'use client';

import { useEffect, useMemo, useState } from 'react';
import { ThemeConfigProvider } from '@render-store/sdk';
import { informaticThemeContract } from '@informatic-theme/informaticTheme';
import {
  InformaticBlogListProvider,
  InformaticBlogPostProvider,
  InformaticCustomPageProvider,
  InformaticStorePolicyProvider,
  type InformaticBlogListPostData,
  type InformaticBlogPostData,
  type InformaticCustomPageData,
  type InformaticStorePolicyApiType,
  type InformaticStorePolicyData,
} from '@informatic-theme/sdk-shim';
import '@informatic-theme/theme.css';
import api from '@/lib/api';
import { storeBlogApi } from '@/lib/store-blog';
import { storePageApi } from '@/lib/store-page';
import { storePolicyApi, type StorePolicyType } from '@/lib/store-policy';
import { getConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { InformaticInspectorLayer } from './InformaticInspectorLayer';
import { InformaticEditorContactFormProvider } from './InformaticEditorContactFormProvider';
import { InformaticEditorLeadGenFormProvider } from './InformaticEditorLeadGenFormProvider';
import type { BlogPostPreviewSelection } from './blog-page-preview.util';
import type { CustomPagePreviewSelection } from './custom-page-preview.util';
import {
  isInformaticPolicyTemplateId,
  policyTemplateIdToApiType,
} from '@/lib/informatic-policy-pages';

const PAGE_MAP = {
  index: informaticThemeContract.HomePage,
  about: informaticThemeContract.AboutPage,
  features: informaticThemeContract.FeaturesPage,
  pricing: informaticThemeContract.PricingPage,
  blog_list: informaticThemeContract.BlogListPage,
  blog_post: informaticThemeContract.BlogPostPage,
  page: informaticThemeContract.CustomPage,
  contact: informaticThemeContract.ContactPage,
  faq: informaticThemeContract.FaqPage,
  privacy: informaticThemeContract.PrivacyPage,
  terms: informaticThemeContract.TermsPage,
  return_refund: informaticThemeContract.ReturnRefundPolicyPage,
  contact_info: informaticThemeContract.ContactInformationPolicyPage,
  '404': informaticThemeContract.NotFoundPage,
  search: informaticThemeContract.SearchPage,
} as const;

export type InformaticPreviewPageId = keyof typeof PAGE_MAP;

type StorefrontBlogPostPayload = {
  blog: { title: string; urlHandle: string } | null;
  post: {
    title: string;
    content: string;
    excerpt: string;
    author: string;
    featuredImageUrl: string;
    urlHandle: string;
    visibility: 'visible' | 'hidden';
    updatedAt?: string;
    createdAt?: string;
  };
};

function usePreviewFavicon(config: Record<string, unknown>) {
  const url = String(getConfigPath(config, 'settings.logo.faviconUrl') || '').trim();
  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>('link[data-informatic-favicon="1"]');
    if (!url) {
      existing?.remove();
      return;
    }
    const link = existing || document.createElement('link');
    link.setAttribute('data-informatic-favicon', '1');
    link.rel = 'icon';
    link.href = url;
    if (!existing) document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [url]);
}

function useEditorBlogPostPreview(
  storeId: string | null | undefined,
  pageId: InformaticPreviewPageId,
  selection: BlogPostPreviewSelection | null | undefined
) {
  const [post, setPost] = useState<InformaticBlogPostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postSlug = pageId === 'blog_post' ? selection?.postHandle?.trim() || null : null;

  useEffect(() => {
    if (pageId !== 'blog_post' || !storeId || !postSlug) {
      setPost(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void api
      .get<{ success: boolean; message?: string; data?: StorefrontBlogPostPayload }>(
        `/storefront/${storeId}/blog-posts/by-slug/${encodeURIComponent(postSlug)}`,
        { params: { preview: '1' } }
      )
      .then((res) => {
        if (cancelled) return;
        const payload = res.data.data;
        if (res.data.success && payload) {
          setPost({
            title: payload.post.title,
            content: payload.post.content,
            excerpt: payload.post.excerpt,
            author: payload.post.author,
            featuredImageUrl: payload.post.featuredImageUrl,
            urlHandle: payload.post.urlHandle,
            visibility: payload.post.visibility,
            updatedAt: payload.post.updatedAt,
            createdAt: payload.post.createdAt,
            blog: payload.blog,
          });
          setError(null);
        } else {
          setPost(null);
          setError(res.data.message || 'Blog post not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPost(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load blog post';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageId, postSlug, storeId]);

  return useMemo(
    () => ({
      storeId: storeId ?? null,
      postSlug,
      post,
      loading,
      error,
      preview: true,
    }),
    [storeId, postSlug, post, loading, error]
  );
}

function useEditorBlogListPreview(
  storeId: string | null | undefined,
  pageId: InformaticPreviewPageId
) {
  const [posts, setPosts] = useState<InformaticBlogListPostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pageId !== 'blog_list') {
      setPosts([]);
      setLoading(false);
      setError(null);
      return;
    }
    if (!storeId) {
      setPosts([]);
      setLoading(false);
      setError('Select a store to preview blog posts');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void storeBlogApi
      .listPosts(storeId)
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
        setPosts(
          rows.map((row) => ({
            title: row.title,
            excerpt: row.excerpt || '',
            urlHandle: row.urlHandle,
            author: row.author,
            featuredImageUrl: row.featuredImageUrl,
            visibility: row.visibility,
            updatedAt: row.updatedAt,
            createdAt: row.createdAt,
            blogTitle: row.blogTitle,
          }))
        );
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPosts([]);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load blog posts';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageId, storeId]);

  return useMemo(
    () => ({
      storeId: storeId ?? null,
      posts,
      loading,
      error,
      preview: true,
    }),
    [storeId, posts, loading, error]
  );
}

function useEditorCustomPagePreview(
  storeId: string | null | undefined,
  pageId: InformaticPreviewPageId,
  selection: CustomPagePreviewSelection | null | undefined
) {
  const [page, setPage] = useState<InformaticCustomPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageHandle = pageId === 'page' ? selection?.urlHandle?.trim() || null : null;

  useEffect(() => {
    if (pageId !== 'page' || !pageHandle) {
      setPage(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (!storeId) {
      setPage(null);
      setLoading(false);
      setError('Select a store to preview custom pages');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void storePageApi
      .getPageByHandle(storeId, pageHandle)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data.data;
        if (res.data.success && payload) {
          setPage({
            title: payload.title,
            content: payload.content,
            pageTitle: payload.pageTitle,
            metaDescription: payload.metaDescription,
            urlHandle: payload.urlHandle,
            visibility: payload.visibility,
            updatedAt: payload.updatedAt,
          });
          setError(null);
        } else {
          setPage(null);
          setError(res.data.message || 'Page not found');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPage(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load page';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageHandle, pageId, storeId]);

  return useMemo(
    () => ({
      storeId: storeId ?? null,
      pageHandle,
      page,
      loading,
      error,
      preview: true,
    }),
    [storeId, pageHandle, page, loading, error]
  );
}

function useEditorStorePolicyPreview(
  storeId: string | null | undefined,
  pageId: InformaticPreviewPageId
) {
  const [policy, setPolicy] = useState<InformaticStorePolicyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const policyType: InformaticStorePolicyApiType | null = isInformaticPolicyTemplateId(pageId)
    ? policyTemplateIdToApiType(pageId)
    : null;

  useEffect(() => {
    if (!policyType) {
      setPolicy(null);
      setLoading(false);
      setError(null);
      return;
    }
    if (!storeId) {
      setPolicy(null);
      setLoading(false);
      setError('Select a store to preview policies');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void storePolicyApi
      .getPolicy(storeId, policyType as StorePolicyType)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data.data;
        if (res.data.success && payload?.content?.trim()) {
          setPolicy({
            content: payload.content,
            updatedAt: payload.updatedAt,
          });
          setError(null);
        } else {
          setPolicy(null);
          setError(res.data.message || 'No policy published yet');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPolicy(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load policy';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageId, policyType, storeId]);

  return useMemo(
    () => ({
      storeId: storeId ?? null,
      policyType,
      policy,
      loading,
      error,
    }),
    [storeId, policyType, policy, loading, error]
  );
}

export function InformaticLivePreview({
  config,
  pageId,
  storeId = null,
  blogPostPreview = null,
  customPagePreview = null,
  inspectorEnabled = true,
  selectedNodeId = null,
  onSelectNode,
}: {
  config: Record<string, unknown>;
  pageId: InformaticPreviewPageId;
  storeId?: string | null;
  blogPostPreview?: BlogPostPreviewSelection | null;
  customPagePreview?: CustomPagePreviewSelection | null;
  inspectorEnabled?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string, label: string) => void;
}) {
  const Page = PAGE_MAP[pageId] || informaticThemeContract.HomePage;
  const blogPostCtx = useEditorBlogPostPreview(storeId, pageId, blogPostPreview);
  const blogListCtx = useEditorBlogListPreview(storeId, pageId);
  const customPageCtx = useEditorCustomPagePreview(storeId, pageId, customPagePreview);
  const storePolicyCtx = useEditorStorePolicyPreview(storeId, pageId);
  usePreviewFavicon(config);

  const preview = (
    <InformaticEditorContactFormProvider storeId={storeId}>
      <InformaticEditorLeadGenFormProvider storeId={storeId}>
        <ThemeConfigProvider config={config}>
          <div
            className={`relative min-h-full bg-white ${
              inspectorEnabled ? 'informatic-inspector-on cursor-crosshair' : ''
            }`}
          >
            <Page />
            {onSelectNode ? (
              <InformaticInspectorLayer
                enabled={inspectorEnabled}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
              />
            ) : null}
          </div>
        </ThemeConfigProvider>
      </InformaticEditorLeadGenFormProvider>
    </InformaticEditorContactFormProvider>
  );

  if (pageId === 'blog_post') {
    return (
      <InformaticBlogPostProvider value={blogPostCtx}>{preview}</InformaticBlogPostProvider>
    );
  }

  if (pageId === 'blog_list') {
    return (
      <InformaticBlogListProvider value={blogListCtx}>{preview}</InformaticBlogListProvider>
    );
  }

  if (pageId === 'page') {
    return (
      <InformaticCustomPageProvider value={customPageCtx}>{preview}</InformaticCustomPageProvider>
    );
  }

  if (isInformaticPolicyTemplateId(pageId)) {
    return (
      <InformaticStorePolicyProvider value={storePolicyCtx}>{preview}</InformaticStorePolicyProvider>
    );
  }

  return preview;
}

export const INFORMATIC_PREVIEW_PAGES: Array<{ id: InformaticPreviewPageId; label: string }> = [
  { id: 'index', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'blog_list', label: 'Blog' },
  { id: 'blog_post', label: 'Blog post' },
  { id: 'contact', label: 'Contact' },
  { id: 'faq', label: 'FAQ' },
  { id: '404', label: '404' },
  { id: 'search', label: 'Search' },
];
