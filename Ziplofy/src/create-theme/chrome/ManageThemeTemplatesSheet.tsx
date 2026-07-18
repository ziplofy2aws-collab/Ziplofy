import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useBlogs, type Blog } from '../../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../../contexts/blog-post.context';
import { useCollections, type Collection } from '../../contexts/collection.context';
import { useProducts, type Product } from '../../contexts/product.context';
import { useStorePages, type StorePage } from '../../contexts/store-page.context';
import { useStore } from '../../contexts/store.context';
import {
  listBlogPostsTemplates,
  listBlogsTemplates,
} from '../utils/blog-templates.util';
import { listCollectionTemplates } from '../utils/collection-templates.util';
import { listPageTemplates } from '../utils/page-templates.util';
import { listProductTemplates } from '../utils/product-templates.util';
import './manage-theme-templates-sheet.css';

export type ManageThemeTemplatesKind = 'product' | 'collection' | 'blogs' | 'blog-posts' | 'pages';

type SheetAnimPhase = 'enter' | 'shown' | 'exit';

export type ThemeTemplateOption = {
  value: string;
  label: string;
};

type ManageThemeTemplatesSheetProps = {
  open: boolean;
  kind: ManageThemeTemplatesKind;
  onClose: () => void;
  /** Fired after the slide-down exit animation finishes (safe to unmount). */
  onExited?: () => void;
  /** Live theme editor config — preferred source for template options. */
  themeConfig?: Record<string, unknown> | null;
  /** Called after assignments change so the page picker can refresh counts. */
  onAssignmentsChanged?: (counts: Record<string, number>) => void;
};

const KIND_META: Record<
  ManageThemeTemplatesKind,
  { title: string; entityNoun: string; entitySingular: string; baseId: string; defaultLabel: string }
> = {
  product: {
    title: 'Assign product templates',
    entityNoun: 'products',
    entitySingular: 'product',
    baseId: 'product',
    defaultLabel: 'Default product',
  },
  collection: {
    title: 'Assign collection templates',
    entityNoun: 'collections',
    entitySingular: 'collection',
    baseId: 'collection',
    defaultLabel: 'Default collection',
  },
  blogs: {
    title: 'Assign blog templates',
    entityNoun: 'blogs',
    entitySingular: 'blog',
    baseId: 'blogs',
    defaultLabel: 'Default blog',
  },
  'blog-posts': {
    title: 'Assign blog post templates',
    entityNoun: 'blog posts',
    entitySingular: 'blog post',
    baseId: 'blog-posts',
    defaultLabel: 'Default blog post',
  },
  pages: {
    title: 'Assign page templates',
    entityNoun: 'pages',
    entitySingular: 'page',
    baseId: 'pages',
    defaultLabel: 'Default page',
  },
};

function defaultOptionFor(kind: ManageThemeTemplatesKind): ThemeTemplateOption {
  return { value: 'default', label: KIND_META[kind].defaultLabel };
}

/** Map template config id → stored themeTemplate value (`default` or `{base}.{slug}`). */
function configIdToThemeTemplateValue(kind: ManageThemeTemplatesKind, configId: string): string {
  const base = KIND_META[kind].baseId;
  const normalized = configId.trim().toLowerCase();
  if (!normalized || normalized === base) return 'default';
  return normalized;
}

function optionsFromThemeConfig(
  kind: ManageThemeTemplatesKind,
  themeConfig: Record<string, unknown> | null | undefined
): ThemeTemplateOption[] {
  const defaultOption = defaultOptionFor(kind);
  if (!themeConfig) return [defaultOption];

  const entries =
    kind === 'product'
      ? listProductTemplates(themeConfig)
      : kind === 'collection'
        ? listCollectionTemplates(themeConfig)
        : kind === 'blogs'
          ? listBlogsTemplates(themeConfig)
          : kind === 'blog-posts'
            ? listBlogPostsTemplates(themeConfig)
            : listPageTemplates(themeConfig);

  if (!entries.length) return [defaultOption];

  const options: ThemeTemplateOption[] = entries.map((entry) => ({
    value: configIdToThemeTemplateValue(kind, entry.id),
    label: entry.name,
  }));

  if (!options.some((opt) => opt.value === 'default')) {
    options.unshift(defaultOption);
  }
  return options;
}

/** Map stored `themeTemplate` → JSON template config id. */
export function themeTemplateToConfigId(
  kind: ManageThemeTemplatesKind,
  themeTemplate?: string | null
): string {
  const base = KIND_META[kind].baseId;
  const normalized = (themeTemplate ?? 'default').trim().toLowerCase();
  if (!normalized || normalized === 'default' || normalized === base) return base;
  if (normalized.startsWith(`${base}.`)) return normalized;
  return base;
}

/** Count how many entities use each template config id. */
export function countThemeTemplateAssignments(
  kind: ManageThemeTemplatesKind,
  entities: Array<{ themeTemplate?: string | null }>
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entity of entities) {
    const id = themeTemplateToConfigId(kind, entity.themeTemplate);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

type RowState = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  themeTemplate: string;
  saving?: boolean;
};

export function ManageThemeTemplatesSheet({
  open,
  kind,
  onClose,
  onExited,
  themeConfig = null,
  onAssignmentsChanged,
}: ManageThemeTemplatesSheetProps) {
  const { activeStoreId } = useStore();
  const { products, fetchProductsByStoreId, updateProduct } = useProducts();
  const { collections, fetchCollectionsByStoreId, updateCollection } = useCollections();
  const { blogs, fetchBlogsByStoreId, updateBlog } = useBlogs();
  const { blogPosts, fetchBlogPostsByStoreId, updateBlogPost } = useBlogPosts();
  const { pages, fetchPagesByStoreId, updatePage } = useStorePages();

  const [mounted, setMounted] = useState(false);
  /** Keep portal mounted through exit animation. */
  const [present, setPresent] = useState(() => open);
  const [animPhase, setAnimPhase] = useState<SheetAnimPhase>(() => (open ? 'enter' : 'exit'));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<RowState[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [savingAll, setSavingAll] = useState(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;
  const exitFallbackRef = useRef<number | null>(null);

  const meta = KIND_META[kind];
  const { title, entityNoun, entitySingular } = meta;

  const options = useMemo(
    () => optionsFromThemeConfig(kind, themeConfig),
    [kind, themeConfig]
  );

  const blogsById = useMemo(() => {
    const map = new Map<string, Blog>();
    for (const blog of blogs) map.set(blog._id, blog);
    return map;
  }, [blogs]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CSS keyframe enter/exit — reliable every open (avoids rAF/transition races).
  useEffect(() => {
    if (!open) return;

    if (exitFallbackRef.current != null) {
      window.clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }

    setPresent(true);
    setAnimPhase('enter');
    setLoading(true);
    setSearch('');
    setDirtyIds(new Set());
    setRows([]);
  }, [open]);

  useEffect(() => {
    if (open || !present) return;

    setAnimPhase('exit');
    exitFallbackRef.current = window.setTimeout(() => {
      setPresent(false);
      onExitedRef.current?.();
      exitFallbackRef.current = null;
    }, 400);

    return () => {
      if (exitFallbackRef.current != null) {
        window.clearTimeout(exitFallbackRef.current);
        exitFallbackRef.current = null;
      }
    };
  }, [open, present]);

  const handlePanelAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const name = event.animationName || '';

      if (name.includes('sheet-up') && animPhase === 'enter') {
        setAnimPhase('shown');
        return;
      }

      if (name.includes('sheet-down') && animPhase === 'exit') {
        if (exitFallbackRef.current != null) {
          window.clearTimeout(exitFallbackRef.current);
          exitFallbackRef.current = null;
        }
        setPresent(false);
        onExitedRef.current?.();
      }
    },
    [animPhase]
  );

  useEffect(() => {
    if (!present) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !savingAll && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [present, open, onClose, savingAll]);

  useEffect(() => {
    if (!open) return;
    if (!activeStoreId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadEntities = async () => {
      try {
        if (kind === 'product') {
          await fetchProductsByStoreId(activeStoreId);
        } else if (kind === 'collection') {
          await fetchCollectionsByStoreId(activeStoreId);
        } else if (kind === 'blogs') {
          await fetchBlogsByStoreId(activeStoreId);
        } else if (kind === 'blog-posts') {
          await Promise.all([
            fetchBlogsByStoreId(activeStoreId),
            fetchBlogPostsByStoreId(activeStoreId),
          ]);
        } else {
          await fetchPagesByStoreId(activeStoreId);
        }
      } catch {
        if (!cancelled) toast.error(`Could not load ${entityNoun}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadEntities();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    activeStoreId,
    kind,
    entityNoun,
    fetchProductsByStoreId,
    fetchCollectionsByStoreId,
    fetchBlogsByStoreId,
    fetchBlogPostsByStoreId,
    fetchPagesByStoreId,
  ]);

  useEffect(() => {
    if (!open || loading) return;
    if (dirtyIds.size > 0) return;

    if (kind === 'product') {
      setRows(
        products
          .filter((p) => !p.isDeleted)
          .map((p: Product) => ({
            id: p._id,
            title: p.title?.trim() || 'Untitled product',
            subtitle: p.urlHandle || undefined,
            imageUrl: p.imageUrls?.[0],
            themeTemplate: p.themeTemplate?.trim() || 'default',
          }))
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      );
      return;
    }

    if (kind === 'collection') {
      setRows(
        collections
          .map((c: Collection) => ({
            id: c._id,
            title: c.title?.trim() || 'Untitled collection',
            subtitle: c.urlHandle || undefined,
            imageUrl: c.imageUrl,
            themeTemplate: c.themeTemplate?.trim() || 'default',
          }))
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      );
      return;
    }

    if (kind === 'blogs') {
      setRows(
        blogs
          .map((b: Blog) => ({
            id: b._id,
            title: b.title?.trim() || 'Untitled blog',
            subtitle: b.urlHandle || undefined,
            themeTemplate: b.themeTemplate?.trim() || 'default',
          }))
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      );
      return;
    }

    if (kind === 'blog-posts') {
      setRows(
        blogPosts
          .map((post: BlogPost) => {
            const blog = blogsById.get(post.blogId);
            const blogHandle = blog?.urlHandle?.trim();
            const postHandle = post.urlHandle?.trim();
            const path =
              blogHandle && postHandle
                ? `${blogHandle}/${postHandle}`
                : postHandle || blog?.title || undefined;
            return {
              id: post._id,
              title: post.title?.trim() || 'Untitled blog post',
              subtitle: path,
              imageUrl: post.featuredImageUrl || undefined,
              themeTemplate: post.themeTemplate?.trim() || 'default',
            };
          })
          .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      );
      return;
    }

    setRows(
      pages
        .map((page: StorePage) => ({
          id: page._id,
          title: page.title?.trim() || 'Untitled page',
          subtitle: page.urlHandle || undefined,
          themeTemplate: page.themeTemplate?.trim() || 'default',
        }))
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
    );
  }, [
    open,
    loading,
    kind,
    products,
    collections,
    blogs,
    blogPosts,
    blogsById,
    pages,
    dirtyIds.size,
  ]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        (row.subtitle && row.subtitle.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const dirtyCount = dirtyIds.size;

  const handleTemplateChange = useCallback((id: string, nextTemplate: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, themeTemplate: nextTemplate } : row))
    );
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const emitCounts = useCallback(
    (entityRows: RowState[]) => {
      onAssignmentsChanged?.(
        countThemeTemplateAssignments(
          kind,
          entityRows.map((r) => ({ themeTemplate: r.themeTemplate }))
        )
      );
    },
    [kind, onAssignmentsChanged]
  );

  const handleSave = useCallback(async () => {
    if (!dirtyCount || savingAll) return;
    setSavingAll(true);
    const toSave = rows.filter((row) => dirtyIds.has(row.id));
    const failed: string[] = [];

    for (const row of toSave) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, saving: true } : r))
      );
      try {
        if (kind === 'product') {
          await updateProduct(row.id, { themeTemplate: row.themeTemplate });
        } else if (kind === 'collection') {
          await updateCollection(row.id, { themeTemplate: row.themeTemplate });
        } else if (kind === 'blogs') {
          await updateBlog(row.id, {
            storeId: activeStoreId ?? undefined,
            themeTemplate: row.themeTemplate,
          });
        } else if (kind === 'blog-posts') {
          await updateBlogPost(row.id, {
            storeId: activeStoreId ?? undefined,
            themeTemplate: row.themeTemplate,
          });
        } else {
          await updatePage(row.id, {
            storeId: activeStoreId ?? undefined,
            themeTemplate: row.themeTemplate,
          });
        }
      } catch {
        failed.push(row.title);
      } finally {
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, saving: false } : r))
        );
      }
    }

    setSavingAll(false);

    if (failed.length) {
      toast.error(
        failed.length === 1
          ? `Could not save template for “${failed[0]}”`
          : `Could not save ${failed.length} ${entityNoun}`
      );
      return;
    }

    setDirtyIds(new Set());
    emitCounts(rows);
    toast.success(
      toSave.length === 1
        ? 'Template assignment saved'
        : `Saved templates for ${toSave.length} ${entityNoun}`
    );
  }, [
    dirtyCount,
    savingAll,
    rows,
    dirtyIds,
    kind,
    updateProduct,
    updateCollection,
    updateBlog,
    updateBlogPost,
    updatePage,
    activeStoreId,
    entityNoun,
    emitCounts,
  ]);

  if (!mounted || !present) return null;

  const showContent = !loading && Boolean(activeStoreId);
  const animClass =
    animPhase === 'enter' ? 'is-enter' : animPhase === 'exit' ? 'is-exit' : 'is-shown';

  return createPortal(
    <div className="fixed inset-0 z-[15000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className={`manage-theme-templates-sheet__backdrop ${animClass}`}
        aria-label="Close manage templates"
        onClick={() => {
          if (!savingAll && open) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-theme-templates-title"
        className={`manage-theme-templates-sheet__panel ${animClass}`}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <div className="flex shrink-0 items-center justify-center py-2.5">
          <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
        </div>

        {loading || !activeStoreId ? (
          <div
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-5 pb-10"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            {!activeStoreId ? (
              <p className="text-[13px] text-gray-500">Select a store to manage templates.</p>
            ) : (
              <>
                <span
                  className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#005bd3]"
                  aria-hidden
                />
                <p className="text-[13px] text-gray-500">Loading {entityNoun}…</p>
                <span className="sr-only">Loading {entityNoun}</span>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e8e8e8] px-4 pb-3 pt-0.5 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="manage-theme-templates-title"
                  className="text-[16px] font-semibold text-gray-900"
                >
                  {title}
                </h2>
                <p className="mt-0.5 text-[12px] leading-snug text-gray-500">
                  Choose which theme template each {entitySingular} uses on the storefront. Changes
                  save to the {entitySingular} record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!savingAll) onClose();
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="shrink-0 border-b border-[#e8e8e8] px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-2 rounded-[10px] border border-[#c9cccf] bg-white px-2.5 py-2">
                <MagnifyingGlassIcon className="h-[18px] w-[18px] shrink-0 text-gray-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${entityNoun}`}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {showContent && filteredRows.length === 0 ? (
                <p className="px-5 py-10 text-center text-[13px] text-gray-500">
                  {rows.length === 0 ? `No ${entityNoun} in this store yet.` : 'No matches.'}
                </p>
              ) : (
                <ul className="divide-y divide-[#f0f0f0]">
                  {filteredRows.map((row) => {
                    const selectedExists = options.some((opt) => opt.value === row.themeTemplate);
                    const selectValue = selectedExists ? row.themeTemplate : 'default';
                    const isDirty = dirtyIds.has(row.id);

                    return (
                      <li
                        key={row.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <PhotoIcon className="h-5 w-5 text-gray-400" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-gray-900">
                              {row.title}
                            </p>
                            {row.subtitle ? (
                              <p className="truncate text-[12px] text-gray-500">/{row.subtitle}</p>
                            ) : null}
                            {isDirty ? (
                              <p className="mt-0.5 text-[11px] font-medium text-amber-700">
                                Unsaved
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <label className="flex w-full shrink-0 flex-col gap-1 sm:w-[220px]">
                          <span className="sr-only">Template for {row.title}</span>
                          <select
                            value={selectValue}
                            disabled={Boolean(row.saving) || savingAll}
                            onChange={(e) => handleTemplateChange(row.id, e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13px] text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-60"
                          >
                            {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e8e8e8] bg-white px-4 py-3 sm:px-5">
              <p className="text-[12px] text-gray-500">
                {dirtyCount
                  ? `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}`
                  : `${rows.length} ${entityNoun}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!savingAll) onClose();
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!dirtyCount || savingAll || !activeStoreId}
                  onClick={() => void handleSave()}
                  className="rounded-lg bg-[#005bd3] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#004fb8] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {savingAll ? 'Saving…' : 'Save assignments'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ManageThemeTemplatesSheet;
