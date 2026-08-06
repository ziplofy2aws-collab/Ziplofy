import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import codiicLogo from '../assets/codiic-logo.png';
import AdminNavbarSearch from '../components/AdminNavbarSearch';
import StoreDropdown from '../components/StoreDropdown';
import { axiosi } from '../config/axios.config';
import { useCollections } from '../contexts/collection.context';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogs } from '../contexts/blog.context';
import { useCustomerTags } from '../contexts/customer-tags.context';
import { useCustomers } from '../contexts/customer.context';
import {
  useInstalledThemes,
  type InstalledThemeDoc,
} from '../contexts/installed-themes.context';
import { usePackaging } from '../contexts/packaging.context';
import { useProductTags } from '../contexts/product-tags.context';
import { useProductType } from '../contexts/product-type.context';
import { useStore } from '../contexts/store.context';
import {
  useStoreCustomThemes,
  type StoreCustomTheme,
} from '../contexts/store-custom-themes.context';
import { useTransferTags } from '../contexts/transfer-tags.context';
import { useVendors } from '../contexts/vendor.context';
import { slugFromTitle, truncateSeoText } from '../seo/seo-text.util';
import { openThemeEditorPathInNewTab } from '../utils/theme-creator-navigation';
import {
  CodiixChatPanel,
  CodiixFaceIcon,
  kindLabelForTheme,
  type CodiixAppliedThemeInfo,
  type CodiixBlogOption,
  type CodiixCreateBlogInput,
  type CodiixCreateBlogPostInput,
  type CodiixCreateBlogPostResult,
  type CodiixCreateBlogResult,
  type CodiixCreateCollectionInput,
  type CodiixCreateCollectionResult,
  type CodiixThemeKind,
  type CodiixThemePickOption,
  themeEditorPathForApplied,
} from '../create-theme/codiix';

async function fetchInstalledThemesFresh(storeId: string): Promise<InstalledThemeDoc[]> {
  const { data: body } = await axiosi.get<{ success?: boolean; data?: InstalledThemeDoc[] }>(
    `/installed-themes/store/${storeId}?_t=${Date.now()}`,
  );
  return body?.data ?? [];
}

const codiicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveStoreId, activeStoreId, stores, setStores, applyStoreCustomTheme } = useStore();
  const { createBlog, fetchBlogsByStoreId } = useBlogs();
  const { createBlogPost } = useBlogPosts();
  const { createCollection } = useCollections();
  const { fetchByStoreId: fetchInstalledThemes, applyTheme } = useInstalledThemes();
  const { getByStoreId: fetchStoreCustomThemes } = useStoreCustomThemes();
  const { fetchCustomersByStoreId } = useCustomers();
  const { fetchCustomerTags } = useCustomerTags();
  const { fetchProductTags } = useProductTags();
  const { getProductTypesByStoreId } = useProductType();
  const { fetchPackagingsByStoreId } = usePackaging();
  const { fetchVendorsByStoreId } = useVendors();
  const { fetchByStore: fetchTransferTags } = useTransferTags();
  const [codiixOpen, setCodiixOpen] = useState(false);
  const [codiixExpanded, setCodiixExpanded] = useState(true);

  useEffect(() => {
    if (activeStoreId) {
      fetchCustomersByStoreId(activeStoreId);
      fetchCustomerTags(activeStoreId);
      fetchProductTags(activeStoreId);
      getProductTypesByStoreId(activeStoreId);
      fetchPackagingsByStoreId(activeStoreId);
      fetchVendorsByStoreId(activeStoreId);
      fetchTransferTags(activeStoreId);
    }
  }, [
    activeStoreId,
    fetchCustomersByStoreId,
    fetchCustomerTags,
    fetchProductTags,
    getProductTypesByStoreId,
    fetchPackagingsByStoreId,
    fetchVendorsByStoreId,
    fetchTransferTags,
  ]);

  const handleStoreChange = useCallback((storeId: string) => {
    setActiveStoreId(storeId);
  }, [setActiveStoreId]);

  const toggleCodiix = useCallback(() => setCodiixOpen((v) => !v), []);
  const closeCodiix = useCallback(() => setCodiixOpen(false), []);
  const navigateAdmin = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  const handleCreateBlog = useCallback(
    async (input: CodiixCreateBlogInput): Promise<CodiixCreateBlogResult> => {
      if (!activeStoreId) {
        toast.error('Select a store before creating a blog');
        throw new Error('Select a store before creating a blog');
      }
      const blog = await createBlog({
        storeId: activeStoreId,
        title: input.title,
        urlHandle: input.urlHandle,
        comments: input.comments,
      });
      toast.success('Blog created');
      return {
        id: blog._id,
        title: blog.title,
        path: `/content/blogs/${blog._id}`,
      };
    },
    [activeStoreId, createBlog],
  );

  const handleListBlogs = useCallback(async (): Promise<CodiixBlogOption[]> => {
    if (!activeStoreId) return [];
    const list = await fetchBlogsByStoreId(activeStoreId);
    return list.map((blog) => ({ id: blog._id, title: blog.title }));
  }, [activeStoreId, fetchBlogsByStoreId]);

  const handleCreateBlogPost = useCallback(
    async (input: CodiixCreateBlogPostInput): Promise<CodiixCreateBlogPostResult> => {
      if (!activeStoreId) {
        toast.error('Select a store before creating a blog post');
        throw new Error('Select a store before creating a blog post');
      }
      const post = await createBlogPost({
        storeId: activeStoreId,
        blogId: input.blogId,
        title: input.title,
        content: input.content,
        author: input.author,
        visibility: input.visibility,
        urlHandle: input.urlHandle,
      });
      toast.success('Blog post created');
      return {
        id: post._id,
        title: post.title,
        path: `/content/articles/${post._id}`,
      };
    },
    [activeStoreId, createBlogPost],
  );

  const handleCreateCollection = useCallback(
    async (input: CodiixCreateCollectionInput): Promise<CodiixCreateCollectionResult> => {
      if (!activeStoreId) {
        toast.error('Select a store before creating a collection');
        throw new Error('Select a store before creating a collection');
      }
      const title = input.title.trim();
      const description = (input.description ?? '').trim() || title;
      const pageTitle = title;
      const metaDescription = truncateSeoText(description);
      const urlHandle =
        (input.urlHandle ?? '').trim() || slugFromTitle(title, 'collection');

      const collection = await createCollection({
        storeId: activeStoreId,
        title,
        description,
        pageTitle,
        metaDescription,
        urlHandle,
        productSort: input.productSort ?? 'manual',
        status: input.status ?? 'published',
        productIds: [],
      });
      toast.success('Collection created');
      return {
        id: collection._id,
        title: collection.title,
        path: `/products/collections/${collection._id}`,
      };
    },
    [activeStoreId, createCollection],
  );

  const resolveAppliedTheme = useCallback(async (): Promise<CodiixAppliedThemeInfo | null> => {
    if (!activeStoreId) return null;

    const store = stores.find((s) => s._id === activeStoreId);
    const appliedCustomThemeId = store?.appliedCustomThemeId
      ? String(store.appliedCustomThemeId)
      : null;
    const appliedThemeId = store?.appliedTheme ? String(store.appliedTheme) : null;

    const [customs, installed] = await Promise.all([
      fetchStoreCustomThemes(activeStoreId).catch(() => [] as StoreCustomTheme[]),
      fetchInstalledThemesFresh(activeStoreId).catch(() => [] as InstalledThemeDoc[]),
    ]);
    void fetchInstalledThemes(activeStoreId).catch(() => undefined);

    if (appliedCustomThemeId) {
      const custom = customs.find((t) => String(t._id) === appliedCustomThemeId);
      if (custom) {
        const kind: CodiixThemeKind = 'custom';
        return {
          name: custom.themeName,
          kind,
          kindLabel: kindLabelForTheme(kind),
          description: custom.themeDesc,
          themeId: custom._id,
        };
      }
    }

    if (appliedThemeId) {
      const row = installed.find(
        (t) =>
          String(t.installedThemeId) === appliedThemeId || String(t._id) === appliedThemeId,
      );
      if (row) {
        const isLegacy = Boolean(row.isCustomTheme || String(row._id).startsWith('custom-'));
        const kind: CodiixThemeKind = isLegacy ? 'legacy-custom' : 'catalog';
        const legacyId = String(
          (row as InstalledThemeDoc & { customThemeId?: string }).customThemeId ||
            String(row._id).replace(/^custom-/, ''),
        );
        return {
          name: row.name,
          kind,
          kindLabel: kindLabelForTheme(kind),
          description: row.description,
          themeId: isLegacy ? legacyId : String(row._id),
        };
      }
      return {
        name: 'Installed theme',
        kind: 'catalog',
        kindLabel: kindLabelForTheme('catalog'),
        themeId: appliedThemeId,
      };
    }

    return null;
  }, [activeStoreId, stores, fetchStoreCustomThemes, fetchInstalledThemes]);

  const listThemePicks = useCallback(async (): Promise<CodiixThemePickOption[]> => {
    if (!activeStoreId) return [];

    const store = stores.find((s) => s._id === activeStoreId);
    const appliedCustomThemeId = store?.appliedCustomThemeId
      ? String(store.appliedCustomThemeId)
      : null;
    const appliedThemeId = store?.appliedTheme ? String(store.appliedTheme) : null;

    const [customs, installed] = await Promise.all([
      fetchStoreCustomThemes(activeStoreId).catch(() => [] as StoreCustomTheme[]),
      fetchInstalledThemesFresh(activeStoreId).catch(() => [] as InstalledThemeDoc[]),
    ]);
    void fetchInstalledThemes(activeStoreId).catch(() => undefined);

    const customPicks: CodiixThemePickOption[] = customs.map((t) => {
      const kind: CodiixThemeKind = 'custom';
      return {
        id: `custom-${t._id}`,
        label: t.themeName,
        kind,
        kindLabel: kindLabelForTheme(kind),
        themeId: t._id,
        live: appliedCustomThemeId === String(t._id),
      };
    });

    const catalogPicks: CodiixThemePickOption[] = installed
      .filter((t) => !t.isCustomTheme && !String(t._id).startsWith('custom-'))
      .map((t) => {
        const kind: CodiixThemeKind = 'catalog';
        const applyId = String(t._id);
        const live =
          !!appliedThemeId &&
          (appliedThemeId === applyId || appliedThemeId === String(t.installedThemeId));
        return {
          id: `catalog-${t._id}`,
          label: t.name,
          kind,
          kindLabel: kindLabelForTheme(kind),
          themeId: applyId,
          live,
        };
      });

    const legacyPicks: CodiixThemePickOption[] = installed
      .filter((t) => Boolean(t.isCustomTheme || String(t._id).startsWith('custom-')))
      .map((t) => {
        const kind: CodiixThemeKind = 'legacy-custom';
        const applyId = String((t as InstalledThemeDoc & { customThemeId?: string }).customThemeId || t._id);
        return {
          id: `legacy-${t._id}`,
          label: t.name,
          kind,
          kindLabel: kindLabelForTheme(kind),
          themeId: applyId,
          live: !!appliedThemeId && appliedThemeId === applyId,
        };
      });

    return [...customPicks, ...catalogPicks, ...legacyPicks];
  }, [activeStoreId, stores, fetchStoreCustomThemes, fetchInstalledThemes]);

  const handleApplyThemePick = useCallback(
    async (pick: CodiixThemePickOption): Promise<CodiixAppliedThemeInfo> => {
      if (!activeStoreId) {
        throw new Error('Select a store before changing themes');
      }

      if (pick.kind === 'custom') {
        await applyStoreCustomTheme(activeStoreId, pick.themeId);
        setStores((prev) =>
          prev.map((s) =>
            s._id === activeStoreId
              ? { ...s, appliedCustomThemeId: pick.themeId, appliedTheme: null }
              : s,
          ),
        );
      } else {
        const ok = await applyTheme(activeStoreId, pick.themeId, pick.label);
        if (!ok) throw new Error('Failed to apply theme');
        setStores((prev) =>
          prev.map((s) =>
            s._id === activeStoreId
              ? { ...s, appliedTheme: pick.themeId, appliedCustomThemeId: null }
              : s,
          ),
        );
      }

      return {
        name: pick.label,
        kind: pick.kind,
        kindLabel: pick.kindLabel,
        themeId: pick.themeId,
      };
    },
    [activeStoreId, applyStoreCustomTheme, applyTheme, setStores],
  );

  const openAppliedThemeEditor = useCallback(async (): Promise<CodiixAppliedThemeInfo> => {
    const info = await resolveAppliedTheme();
    if (!info) {
      throw new Error(
        'No theme is applied on your store yet. Apply one first, then I can open the editor.',
      );
    }
    const path = themeEditorPathForApplied(info);
    const opened = openThemeEditorPathInNewTab(path);
    if (!opened) {
      throw new Error(
        'Your browser blocked the new tab. Allow pop-ups for this site, or open Themes and edit from there.',
      );
    }
    return info;
  }, [resolveAppliedTheme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[1201] h-12 border-b border-white/10 bg-admin-header">
      <div className="flex h-full items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Go to home"
          >
            <img src={codiicLogo} alt="codiic Logo" className="h-8 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        <div className="mx-4 max-w-[500px] flex-1">
          <AdminNavbarSearch />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleCodiix}
            className={`codiix-header-btn codiix-header-btn--on-dark ${codiixOpen ? 'codiix-header-btn--active' : ''}`}
            title="Ask Codiix"
            aria-label="Ask Codiix"
            aria-pressed={codiixOpen}
            aria-haspopup="dialog"
          >
            <CodiixFaceIcon className="h-7 w-7" title="Codiix" />
          </button>
          <div className="relative">
            <StoreDropdown onStoreChange={handleStoreChange} />
          </div>
        </div>
      </div>

      <CodiixChatPanel
        open={codiixOpen}
        onClose={closeCodiix}
        expanded={codiixExpanded}
        onExpandedChange={setCodiixExpanded}
        surface="admin"
        onNavigateAdmin={navigateAdmin}
        onCreateBlog={handleCreateBlog}
        onListBlogs={handleListBlogs}
        onCreateBlogPost={handleCreateBlogPost}
        onCreateCollection={handleCreateCollection}
        onGetAppliedTheme={resolveAppliedTheme}
        onListThemePicks={listThemePicks}
        onApplyThemePick={handleApplyThemePick}
        onOpenAppliedThemeEditor={openAppliedThemeEditor}
      />
    </header>
  );
};

export default codiicNavbar;
