import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  Bars3Icon,
  CheckIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  TagIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBlogs, type Blog } from '../contexts/blog.context';
import { useBlogPosts, type BlogPost } from '../contexts/blog-post.context';
import { useCollections, type Collection } from '../contexts/collection.context';
import { useProducts, type Product } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { useStoreMenus } from '../contexts/store-menu.context';
import { menuItemDraftsToApiInputs, type MenuItemDraft } from '../utils/store-menu-draft.util';
import {
  blogLinkPath,
  blogPostLinkPath,
} from '../components/theme-editor/ThemeEditorLinkPicker';

type LinkPickerOption = {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hasChildren?: boolean;
};

type LinkPickerSection = {
  id: string;
  title: string;
  options: LinkPickerOption[];
};

const LINK_PICKER_SECTIONS: LinkPickerSection[] = [
  {
    id: 'online-store',
    title: 'Online store',
    options: [
      { id: 'home', label: 'Home page', value: '/', icon: HomeIcon },
      { id: 'search', label: 'Search', value: '/search', icon: MagnifyingGlassIcon },
      { id: 'collections', label: 'Collections', value: '/collections', icon: TagIcon, hasChildren: true },
      { id: 'products', label: 'Products', value: '/products', icon: TagIcon, hasChildren: true },
      { id: 'pages', label: 'Pages', value: '/pages', icon: DocumentTextIcon, hasChildren: true },
      { id: 'blogs', label: 'Blogs', value: '/blogs', icon: PencilSquareIcon, hasChildren: true },
      { id: 'blog-posts', label: 'Blog posts', value: '/blogs/news', icon: PencilSquareIcon, hasChildren: true },
      { id: 'policies', label: 'Policies', value: '/policies', icon: DocumentTextIcon, hasChildren: true },
    ],
  },
  {
    id: 'customer-accounts',
    title: 'Customer accounts',
    options: [
      { id: 'orders', label: 'Orders', value: '/account/orders', icon: ArchiveBoxIcon },
      { id: 'profile', label: 'Profile', value: '/account/profile', icon: UserCircleIcon },
      { id: 'settings', label: 'Settings', value: '/account/settings', icon: Cog6ToothIcon },
      { id: 'apps', label: 'Apps', value: '/account/apps', icon: Squares2X2Icon, hasChildren: true },
    ],
  },
];

export function slugifyMenuHandle(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'menu';
}

export function createMenuItem(): MenuItemDraft {
  return { id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`, label: '', link: '' };
}

type LinkPickerSelection = {
  link: string;
  label?: string;
  linkType?: MenuItemDraft['linkType'];
  collectionId?: string;
  productId?: string;
};

type LinkPickerView = 'root' | 'collections' | 'products' | 'blogs' | 'blog-posts';

function collectionLinkPath(collection: Collection): string {
  const handle = collection.urlHandle?.trim();
  return handle ? `/collections/${handle}` : `/collections/${collection._id}`;
}

function productLinkPath(product: Product): string {
  const handle = product.urlHandle?.trim();
  return handle ? `/products/${handle}` : `/products/${product._id}`;
}

function LinkPickerDropdown({
  open,
  storeId,
  searchQuery,
  onSelect,
  onClose,
}: {
  open: boolean;
  storeId: string | null;
  searchQuery: string;
  onSelect: (selection: LinkPickerSelection) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
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
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose]);

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.urlHandle.toLowerCase().includes(q)
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

  if (!open) return null;

  const collectionsResultCount = filteredCollections.length + 1;
  const productsResultCount = filteredProducts.length + 1;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[min(300px,50vh)] overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-md"
    >
      {view === 'collections' || view === 'products' || view === 'blogs' || view === 'blog-posts' ? (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-2">
            <button
              type="button"
              onClick={() => setView('root')}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-normal text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <span className="text-xs text-gray-500">
              {view === 'collections'
                ? collectionsLoading
                  ? 'Loading…'
                  : `${collectionsResultCount} result${collectionsResultCount === 1 ? '' : 's'}`
                : view === 'products'
                  ? productsLoading
                    ? 'Loading…'
                    : `${productsResultCount} result${productsResultCount === 1 ? '' : 's'}`
                  : view === 'blogs'
                    ? blogsLoading
                      ? 'Loading…'
                      : `${filteredBlogs.length} result${filteredBlogs.length === 1 ? '' : 's'}`
                    : blogPostsLoading
                      ? 'Loading…'
                      : `${filteredBlogPosts.length} result${filteredBlogPosts.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {view === 'collections' ? (
            collectionsLoading ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Loading collections…</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    pickAndClose({
                      link: '/collections',
                      label: 'All collections',
                      linkType: 'all-collections',
                    })
                  }
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
                >
                  <TagIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0 flex-1 truncate">All collections</span>
                </button>
                {filteredCollections.map((collection) => (
                  <button
                    key={collection._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: collectionLinkPath(collection),
                        label: collection.title,
                        linkType: 'specific-collection',
                        collectionId: collection._id,
                      })
                    }
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
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
                  <p className="px-3 py-3 text-center text-sm text-gray-500">No collections found</p>
                ) : null}
              </>
            )
          ) : view === 'products' ? (
            productsLoading ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Loading products…</p>
            ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  pickAndClose({
                    link: '/collections/all',
                    label: 'All products',
                    linkType: 'all-products',
                  })
                }
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
              >
                <TagIcon className="h-5 w-5 shrink-0 text-gray-500" />
                <span className="min-w-0 flex-1 truncate">All products</span>
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
                        linkType: 'specific-product',
                        productId: product._id,
                      })
                    }
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
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
                <p className="px-3 py-3 text-center text-sm text-gray-500">No products found</p>
              ) : null}
            </>
            )
          ) : view === 'blogs' ? (
            blogsLoading ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Loading blogs…</p>
            ) : (
              <>
                {filteredBlogs.map((blog: Blog) => (
                  <button
                    key={blog._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: blogLinkPath(blog),
                        label: blog.title,
                        linkType: 'custom',
                      })
                    }
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{blog.title}</span>
                  </button>
                ))}
                {filteredBlogs.length === 0 ? (
                  <p className="px-3 py-3 text-center text-sm text-gray-500">No blogs found</p>
                ) : null}
              </>
            )
          ) : view === 'blog-posts' ? (
            blogPostsLoading ? (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Loading blog posts…</p>
            ) : (
              <>
                {filteredBlogPosts.map((post: BlogPost) => (
                  <button
                    key={post._id}
                    type="button"
                    onClick={() =>
                      pickAndClose({
                        link: blogPostLinkPath(post, blogHandleById),
                        label: post.title,
                        linkType: 'custom',
                      })
                    }
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" />
                    <span className="min-w-0 flex-1 truncate">{post.title}</span>
                  </button>
                ))}
                {filteredBlogPosts.length === 0 ? (
                  <p className="px-3 py-3 text-center text-sm text-gray-500">No blog posts found</p>
                ) : null}
              </>
            )
          ) : null}
        </>
      ) : (
        LINK_PICKER_SECTIONS.map((section) => (
          <div key={section.id} className="py-1">
            <p className="px-3 py-1.5 text-[11px] font-normal text-gray-400">{section.title}</p>
            {section.options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === 'collections' && opt.hasChildren) {
                      void openCollectionsPicker();
                      return;
                    }
                    if (opt.id === 'products' && opt.hasChildren) {
                      void openProductsPicker();
                      return;
                    }
                    if (opt.id === 'blogs' && opt.hasChildren) {
                      void openBlogsPicker();
                      return;
                    }
                    if (opt.id === 'blog-posts' && opt.hasChildren) {
                      void openBlogPostsPicker();
                      return;
                    }
                    if (opt.hasChildren) return;
                    pickAndClose({
                      link: opt.value,
                      label: opt.label,
                      linkType:
                        opt.id === 'home'
                          ? 'homepage'
                          : opt.value.startsWith('/')
                            ? 'custom'
                            : undefined,
                    });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-normal text-gray-700 hover:bg-gray-50"
                >
                  <Icon className="h-5 w-5 shrink-0 text-gray-500" />
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {opt.hasChildren ? (
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

export function MenuItemRow({
  item,
  storeId,
  onChange,
  onRemove,
  onConfirm,
}: {
  item: MenuItemDraft;
  storeId: string | null;
  onChange: (patch: Partial<MenuItemDraft>) => void;
  onRemove: () => void;
  onConfirm: () => void;
}) {
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);

  return (
    <div className="rounded-md border border-gray-200/80 bg-white p-2.5">
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-6 shrink-0 cursor-grab rounded p-0.5 text-gray-300 hover:bg-gray-50 hover:text-gray-500 active:cursor-grabbing"
          aria-label="Reorder menu item"
        >
          <Bars3Icon className="h-4 w-4" />
        </button>

        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-0.5 block text-xs font-normal text-gray-500">Label</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="e.g., About us"
              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </div>

          <div className="relative">
            <label className="mb-0.5 block text-xs font-normal text-gray-500">Link</label>
            <input
              type="text"
              value={item.linkLabel ?? item.link}
              onChange={(e) =>
                onChange({
                  link: e.target.value,
                  linkLabel: undefined,
                })
              }
              onFocus={() => setLinkPickerOpen(true)}
              placeholder="Search or paste link"
              className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
            <LinkPickerDropdown
              open={linkPickerOpen}
              storeId={storeId}
              searchQuery={item.linkLabel ?? item.link}
              onClose={() => setLinkPickerOpen(false)}
              onSelect={({ link, label, linkType, collectionId, productId }) =>
                onChange({
                  link,
                  linkLabel: label,
                  linkType: linkType ?? (link.trim() ? 'custom' : undefined),
                  collectionId,
                  productId,
                  ...(label && !item.label.trim() ? { label } : {}),
                })
              }
            />
          </div>
        </div>

        <div className="mt-5 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Confirm menu item"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-600"
            aria-label="Remove menu item"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ContentMenuCreatePage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createMenu } = useStoreMenus();
  const nameInputId = useId();
  const [menuName, setMenuName] = useState('');
  const [items, setItems] = useState<MenuItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const displayHandle = useMemo(() => slugifyMenuHandle(menuName), [menuName]);

  const updateItem = useCallback((id: string, patch: Partial<MenuItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addMenuItem = () => {
    setItems((prev) => [...prev, createMenuItem()]);
  };

  const removeMenuItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    const name = menuName.trim();
    if (!name) {
      toast.error('Menu name is required');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving a menu');
      return;
    }

    const apiItems = menuItemDraftsToApiInputs(items);
    if (items.some((row) => row.label.trim()) && apiItems.length === 0) {
      toast.error('Add at least one valid menu item with a label and link');
      return;
    }

    setSaving(true);
    try {
      await createMenu({
        storeId: activeStoreId,
        menuName: name,
        handle: displayHandle,
        items: apiItems,
      });
      toast.success('Menu saved');
      navigate('/content/menus');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-page-background-color">
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
        <nav className="mb-4 flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link
            to="/content/menus"
            className="inline-flex items-center gap-1 font-normal text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="h-3.5 w-3.5" />
            Menus
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-300" aria-hidden />
          <span className="font-normal text-gray-700">Add menu</span>
        </nav>

        <div className="space-y-3">
          <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <label htmlFor={nameInputId} className="mb-1 block text-xs font-normal text-gray-500">
                  Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g., Sidebar menu"
                  className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
              <p className="text-[12px] font-normal text-gray-500">
                <span className="text-gray-600">Handle:</span> {displayHandle || '—'}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <h2 className="text-[13px] font-medium text-gray-800">Menu items</h2>
            </div>

            <div className="space-y-2 p-3">
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  storeId={activeStoreId}
                  onChange={(patch) => updateItem(item.id, patch)}
                  onRemove={() => removeMenuItem(item.id)}
                  onConfirm={() => toast.success('Menu item updated')}
                />
              ))}

              <button
                type="button"
                onClick={addMenuItem}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-200 bg-gray-50/50 px-3 py-3 text-[13px] font-normal text-blue-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Add menu item
              </button>
            </div>
          </section>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-w-22 items-center justify-center rounded-lg bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
