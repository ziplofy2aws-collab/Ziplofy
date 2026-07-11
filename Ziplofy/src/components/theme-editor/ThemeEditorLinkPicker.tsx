import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useBlogs, type Blog } from '../../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../../contexts/blog-post.context';
import { useCollections, type Collection } from '../../contexts/collection.context';
import { useProducts, type Product } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import {
  buildStorefrontBlogPath,
  buildStorefrontBlogPostPath,
} from '../../utils/storefront-url.util';

export type LinkPickerOption = {
  id: string;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  hasChildren?: boolean;
};

export type LinkPickerSelection = {
  link: string;
  label?: string;
};

type LinkPickerView =
  | 'root'
  | 'collections'
  | 'products'
  | 'pages'
  | 'blogs'
  | 'blog-posts'
  | 'policies';

/** Root menu — matches Shopify-style link picker categories. */
export const THEME_LINK_ROOT_OPTIONS: LinkPickerOption[] = [
  { id: 'collections', label: 'Collections', value: '/collections', icon: TagIcon, hasChildren: true },
  { id: 'products', label: 'Products', value: '/products', icon: TagIcon, hasChildren: true },
  { id: 'pages', label: 'Pages', value: '/pages', icon: DocumentTextIcon, hasChildren: true },
  { id: 'blogs', label: 'Blogs', value: '/blogs', icon: PencilSquareIcon, hasChildren: true },
  {
    id: 'blog-posts',
    label: 'Blog posts',
    value: '/blogs',
    icon: PencilSquareIcon,
    hasChildren: true,
  },
  { id: 'policies', label: 'Policies', value: '/policies', icon: DocumentTextIcon, hasChildren: true },
];

const STATIC_PAGE_OPTIONS: LinkPickerOption[] = [
  { id: 'home', label: 'Home page', value: '/', icon: HomeIcon },
  { id: 'search', label: 'Search', value: '/search', icon: MagnifyingGlassIcon },
  { id: 'cart', label: 'Cart', value: '/cart', icon: DocumentTextIcon },
];

const STATIC_POLICY_OPTIONS: LinkPickerOption[] = [
  { id: 'privacy', label: 'Privacy policy', value: '/policies/privacy', icon: DocumentTextIcon },
  { id: 'terms', label: 'Terms of service', value: '/policies/terms', icon: DocumentTextIcon },
  { id: 'refund', label: 'Refund policy', value: '/policies/refund', icon: DocumentTextIcon },
  { id: 'shipping', label: 'Shipping policy', value: '/policies/shipping', icon: DocumentTextIcon },
];

export function collectionLinkPath(collection: Collection): string {
  const handle = collection.urlHandle?.trim();
  return handle ? `/collections/${handle}` : `/collections/${collection._id}`;
}

export function productLinkPath(product: Product): string {
  const handle = product.urlHandle?.trim();
  return handle ? `/products/${handle}` : `/products/${product._id}`;
}

export function blogLinkPath(blog: Blog): string {
  return buildStorefrontBlogPath(blog.urlHandle || blog.title);
}

export function blogPostLinkPath(post: BlogPost, blogHandleById: Map<string, string>): string {
  const blogHandle = blogHandleById.get(post.blogId) ?? '';
  return buildStorefrontBlogPostPath(blogHandle, post.urlHandle || post.title);
}

function filterOptions(options: LinkPickerOption[], query: string): LinkPickerOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
  );
}

export function ThemeEditorLinkPickerDropdown({
  open,
  searchQuery,
  onSelect,
  onClose,
  storeId: storeIdProp,
  placement = 'below',
  boundaryRef,
  anchorRef,
}: {
  open: boolean;
  searchQuery: string;
  onSelect: (selection: LinkPickerSelection) => void;
  onClose: () => void;
  storeId?: string | null;
  /** Pop above the anchor (e.g. Insert link modal) or below (default). */
  placement?: 'below' | 'above';
  /** Clicks inside this element do not close the picker (e.g. the trigger field). */
  boundaryRef?: RefObject<HTMLElement | null>;
  /**
   * When provided, the picker renders in a fixed-position portal anchored to this
   * element, flipping above/below based on available space and clamping its height
   * to the viewport. Use inside scroll/overflow-clipped containers (e.g. modals).
   */
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  const { activeStoreId } = useStore();
  const storeId = storeIdProp ?? activeStoreId;

  const panelRef = useRef<HTMLDivElement>(null);
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);
  const { collections, loading: collectionsLoading, fetchCollectionsByStoreId } = useCollections();
  const { products, loading: productsLoading, fetchProductsByStoreId } = useProducts();
  const { blogs, loading: blogsLoading, fetchBlogsByStoreId } = useBlogs();
  const { blogPosts, loading: blogPostsLoading, fetchBlogPostsByStoreId } = useBlogPosts();
  const [view, setView] = useState<LinkPickerView>('root');

  useEffect(() => {
    if (!open) setView('root');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (boundaryRef?.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose, boundaryRef]);

  useEffect(() => {
    if (!open || !anchorRef) {
      setPortalStyle(null);
      return;
    }
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 6;
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const useAbove =
        placement === 'above' ? spaceAbove >= spaceBelow : spaceBelow < 200 && spaceAbove > spaceBelow;
      const avail = useAbove ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(160, Math.min(320, avail));
      setPortalStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        maxHeight,
        ...(useAbove ? { bottom: viewportH - rect.top + gap } : { top: rect.bottom + gap }),
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchorRef, placement, view]);

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) => c.title.toLowerCase().includes(q) || c.urlHandle.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const active = products.filter((p) => !p.isDeleted && p.status === 'active');
    if (!q) return active;
    return active.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.urlHandle.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const filteredBlogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(q) || blog.urlHandle.toLowerCase().includes(q)
    );
  }, [blogs, searchQuery]);

  const blogHandleById = useMemo(
    () => new Map(blogs.map((blog) => [blog._id, blog.urlHandle])),
    [blogs]
  );

  const filteredBlogPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return blogPosts;
    return blogPosts.filter((post) => {
      const blogTitle = blogs.find((blog) => blog._id === post.blogId)?.title ?? '';
      const haystack = [post.title, post.urlHandle, blogTitle].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [blogPosts, blogs, searchQuery]);

  // The top-level category list always shows every category (Shopify-style).
  // `searchQuery` (the current field value/link) only filters items inside a
  // drill-down view — never the category list — otherwise an already-set link
  // like "/collections" would hide the other categories.
  const filteredRootOptions = THEME_LINK_ROOT_OPTIONS;

  const openCollectionsPicker = useCallback(async () => {
    if (!storeId) {
      toast.error('Select a store before choosing collections');
      return;
    }
    setView('collections');
    try {
      await fetchCollectionsByStoreId(storeId);
    } catch {
      toast.error('Failed to load collections');
    }
  }, [storeId, fetchCollectionsByStoreId]);

  const openProductsPicker = useCallback(async () => {
    if (!storeId) {
      toast.error('Select a store before choosing products');
      return;
    }
    setView('products');
    try {
      await fetchProductsByStoreId(storeId);
    } catch {
      toast.error('Failed to load products');
    }
  }, [storeId, fetchProductsByStoreId]);

  const openBlogsPicker = useCallback(async () => {
    if (!storeId) {
      toast.error('Select a store before choosing blogs');
      return;
    }
    setView('blogs');
    try {
      await fetchBlogsByStoreId(storeId);
    } catch {
      toast.error('Failed to load blogs');
    }
  }, [storeId, fetchBlogsByStoreId]);

  const openBlogPostsPicker = useCallback(async () => {
    if (!storeId) {
      toast.error('Select a store before choosing blog posts');
      return;
    }
    setView('blog-posts');
    try {
      await Promise.all([fetchBlogsByStoreId(storeId), fetchBlogPostsByStoreId(storeId)]);
    } catch {
      toast.error('Failed to load blog posts');
    }
  }, [storeId, fetchBlogsByStoreId, fetchBlogPostsByStoreId]);

  const pickAndClose = (selection: LinkPickerSelection) => {
    onSelect(selection);
    onClose();
    setView('root');
  };

  const renderStaticList = (options: LinkPickerOption[]) => {
    const list = filterOptions(options, searchQuery);
    return (
      <>
        {list.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pickAndClose({ link: opt.value, label: opt.label })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
            >
              <Icon className="h-5 w-5 shrink-0 text-gray-500" />
              <span className="min-w-0 flex-1 truncate">{opt.label}</span>
            </button>
          );
        })}
        {list.length === 0 ? (
          <p className="px-3 py-3 text-center text-[13px] text-gray-500">No results found</p>
        ) : null}
      </>
    );
  };

  if (!open) return null;

  const collectionsResultCount = filteredCollections.length + 1;
  const productsResultCount = filteredProducts.length + 1;
  const isDrillDown = view !== 'root';

  const drillResultCount =
    view === 'collections'
      ? collectionsResultCount
      : view === 'products'
        ? productsResultCount
        : view === 'blogs'
          ? filteredBlogs.length
          : view === 'blog-posts'
            ? filteredBlogPosts.length
            : filterOptions(
                view === 'pages' ? STATIC_PAGE_OPTIONS : STATIC_POLICY_OPTIONS,
                searchQuery
              ).length;

  const usePortal = Boolean(anchorRef);
  const positionClass = usePortal
    ? 'z-[10065]'
    : placement === 'above'
      ? 'absolute left-0 right-0 bottom-full z-[10065] mb-1'
      : 'absolute left-0 right-0 top-full z-30 mt-1';
  const heightClass = usePortal ? '' : 'max-h-[min(320px,50vh)]';

  if (usePortal && !portalStyle) return null;

  const panel = (
    <div
      ref={panelRef}
      style={usePortal ? portalStyle ?? undefined : undefined}
      className={`${positionClass} ${heightClass} overflow-y-auto rounded-xl border border-[#e1e1e1] bg-white py-1 shadow-lg ring-1 ring-black/5`}
    >
      {isDrillDown ? (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-[#e1e1e1] px-2 py-2">
            <button
              type="button"
              onClick={() => setView('root')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <span className="text-[12px] text-gray-500">
              {view === 'collections' && collectionsLoading
                ? 'Loading…'
                : view === 'products' && productsLoading
                  ? 'Loading…'
                  : view === 'blogs' && blogsLoading
                    ? 'Loading…'
                    : view === 'blog-posts' && blogPostsLoading
                      ? 'Loading…'
                      : `${drillResultCount} result${drillResultCount === 1 ? '' : 's'}`}
            </span>
          </div>

          {view === 'collections' ? (
            collectionsLoading ? (
              <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading collections…</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => pickAndClose({ link: '/collections', label: 'All collections' })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                >
                  <TagIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0 flex-1 truncate">All collections</span>
                </button>
                <button
                  type="button"
                  onClick={() => pickAndClose({ link: '/', label: 'Home page' })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                >
                  <PhotoIcon className="h-5 w-5 shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1 truncate">Home page</span>
                </button>
                {filteredCollections.map((collection) => (
                  <button
                    key={collection._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: collectionLinkPath(collection),
                        label: collection.title,
                      })
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                  >
                    {collection.imageUrl ? (
                      <img
                        src={collection.imageUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded object-cover bg-gray-100"
                      />
                    ) : (
                      <PhotoIcon className="h-5 w-5 shrink-0 text-gray-400" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{collection.title}</span>
                  </button>
                ))}
                {filteredCollections.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[13px] text-gray-500">No collections found</p>
                ) : null}
              </>
            )
          ) : view === 'products' ? (
            productsLoading ? (
              <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading products…</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => pickAndClose({ link: '/collections/all', label: 'All Products' })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                >
                  <TagIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0 flex-1 truncate">All Products</span>
                </button>
                {filteredProducts.map((product) => {
                  const imageUrl = product.imageUrls?.[0];
                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() =>
                        pickAndClose({
                          link: productLinkPath(product),
                          label: product.title,
                        })
                      }
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded object-cover bg-gray-100"
                        />
                      ) : (
                        <PhotoIcon className="h-5 w-5 shrink-0 text-gray-400" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{product.title}</span>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[13px] text-gray-500">No products found</p>
                ) : null}
              </>
            )
          ) : view === 'pages' ? (
            renderStaticList(STATIC_PAGE_OPTIONS)
          ) : view === 'blogs' ? (
            blogsLoading ? (
              <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading blogs…</p>
            ) : (
              <>
                {filteredBlogs.map((blog) => (
                  <button
                    key={blog._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: blogLinkPath(blog),
                        label: blog.title,
                      })
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                  >
                    <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{blog.title}</span>
                  </button>
                ))}
                {filteredBlogs.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[13px] text-gray-500">
                    No blogs found. Create one in Content → Blogs.
                  </p>
                ) : null}
              </>
            )
          ) : view === 'blog-posts' ? (
            blogPostsLoading ? (
              <p className="px-3 py-4 text-center text-[13px] text-gray-500">Loading blog posts…</p>
            ) : (
              <>
                {filteredBlogPosts.map((post) => (
                  <button
                    key={post._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: blogPostLinkPath(post, blogHandleById),
                        label: post.title,
                      })
                    }
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
                  >
                    <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{post.title}</span>
                  </button>
                ))}
                {filteredBlogPosts.length === 0 ? (
                  <p className="px-3 py-3 text-center text-[13px] text-gray-500">
                    No blog posts found. Create one in Content → Blog posts.
                  </p>
                ) : null}
              </>
            )
          ) : (
            renderStaticList(STATIC_POLICY_OPTIONS)
          )}
        </>
      ) : (
        <>
          {filteredRootOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (opt.id === 'collections') {
                    void openCollectionsPicker();
                    return;
                  }
                  if (opt.id === 'products') {
                    void openProductsPicker();
                    return;
                  }
                  if (opt.id === 'pages') {
                    setView('pages');
                    return;
                  }
                  if (opt.id === 'blogs') {
                    void openBlogsPicker();
                    return;
                  }
                  if (opt.id === 'blog-posts') {
                    void openBlogPostsPicker();
                    return;
                  }
                  if (opt.id === 'policies') {
                    setView('policies');
                    return;
                  }
                  pickAndClose({ link: opt.value, label: opt.label });
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-gray-800 hover:bg-gray-100"
              >
                <Icon className="h-5 w-5 shrink-0 text-gray-500" />
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {opt.hasChildren ? (
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                ) : null}
              </button>
            );
          })}
          {filteredRootOptions.length === 0 ? (
            <p className="px-3 py-3 text-center text-[13px] text-gray-500">No matching link types</p>
          ) : null}
        </>
      )}
    </div>
  );

  if (usePortal && typeof document !== 'undefined') {
    return createPortal(panel, document.body);
  }
  return panel;
}
