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
import { useCollections, type Collection } from '../contexts/collection.context';
import { useProducts, type Product } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { useStoreMenus } from '../contexts/store-menu.context';
import { menuItemDraftsToApiInputs, type MenuItemDraft } from '../utils/store-menu-draft.util';

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

type LinkPickerView = 'root' | 'collections' | 'products';

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
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[min(320px,50vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
    >
      {view === 'collections' || view === 'products' ? (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-2">
            <button
              type="button"
              onClick={() => setView('root')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <span className="text-xs text-gray-500">
              {view === 'collections'
                ? collectionsLoading
                  ? 'Loading…'
                  : `${collectionsResultCount} result${collectionsResultCount === 1 ? '' : 's'}`
                : productsLoading
                  ? 'Loading…'
                  : `${productsResultCount} result${productsResultCount === 1 ? '' : 's'}`}
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
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
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
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
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
          ) : productsLoading ? (
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
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
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
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
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
          )}
        </>
      ) : (
        LINK_PICKER_SECTIONS.map((section) => (
          <div key={section.id} className="py-1">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500">{section.title}</p>
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
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
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
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          type="button"
          className="mt-8 shrink-0 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
          aria-label="Reorder menu item"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Label</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="e.g., About us"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-800">Link</label>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        <div className="mt-7 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Confirm menu item"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
            aria-label="Remove menu item"
          >
            <TrashIcon className="h-5 w-5" />
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
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            to="/content/menus"
            className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900"
          >
            <Bars3Icon className="h-4 w-4" />
            Menus
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" aria-hidden />
          <span className="font-semibold text-gray-900">Add menu</span>
        </nav>

        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor={nameInputId} className="mb-1.5 block text-sm font-semibold text-gray-900">
                  Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g., Sidebar menu"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Handle:</span>{' '}
                <span className="text-gray-500">{displayHandle || '—'}</span>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-gray-900">Menu items</h2>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50/50 hover:border-blue-200"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Add menu item
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-w-[7rem] items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
