import {
  ArrowRightIcon,
  CubeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../contexts/collection.context';
import { useProducts, type ProductSearchBasicItem } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import {
  formatAdminNavBreadcrumb,
  groupAdminNavResults,
  searchAdminNavCatalog,
  type AdminNavSearchItem,
} from '../utils/admin-nav-search';

type FlatResult =
  | { kind: 'nav'; item: AdminNavSearchItem }
  | { kind: 'product'; item: ProductSearchBasicItem }
  | { kind: 'collection'; item: { _id: string; title: string; imageUrl?: string } };

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function AdminNavbarSearch() {
  const navigate = useNavigate();
  const listId = useId();
  const { activeStoreId } = useStore();
  const { searchBasic } = useProducts();
  const { searchCollections } = useCollections();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<ProductSearchBasicItem[]>([]);
  const [collections, setCollections] = useState<
    { _id: string; title: string; imageUrl?: string }[]
  >([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query, 220);

  const navResults = useMemo(
    () => searchAdminNavCatalog(debouncedQuery, 14),
    [debouncedQuery]
  );
  const navGroups = useMemo(() => groupAdminNavResults(navResults), [navResults]);

  const flatResults: FlatResult[] = useMemo(() => {
    const list: FlatResult[] = navResults.map((item) => ({ kind: 'nav', item }));
    for (const p of products) list.push({ kind: 'product', item: p });
    for (const c of collections) list.push({ kind: 'collection', item: c });
    return list;
  }, [navResults, products, collections]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, products, collections]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!open || q.length < 2 || !activeStoreId) {
      setProducts([]);
      setCollections([]);
      setLiveLoading(false);
      return;
    }

    let cancelled = false;
    setLiveLoading(true);

    void (async () => {
      try {
        const [productHits, collectionRes] = await Promise.all([
          searchBasic({ q, storeId: activeStoreId }).catch(() => []),
          searchCollections(activeStoreId, q, 1, 6).catch(() => null),
        ]);
        if (cancelled) return;
        setProducts((productHits || []).slice(0, 6));
        const cols = (collectionRes?.data || []).map((c) => ({
          _id: c._id,
          title: c.title,
          imageUrl: c.imageUrl,
        }));
        setCollections(cols.slice(0, 5));
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStoreId, debouncedQuery, open, searchBasic, searchCollections]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  const goTo = useCallback(
    (path: string) => {
      navigate(path);
      setQuery('');
      close();
      inputRef.current?.blur();
    },
    [close, navigate]
  );

  const activateResult = useCallback(
    (result: FlatResult) => {
      if (result.kind === 'nav') goTo(result.item.path);
      else if (result.kind === 'product') goTo(`/products/${result.item._id}`);
      else goTo(`/products/collections/${result.item._id}`);
    },
    [goTo]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [close]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const isMetaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isMetaK) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (query) setQuery('');
      else close();
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!flatResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flatResults[activeIndex];
      if (hit) activateResult(hit);
    }
  };

  const showPanel = open && (query.trim().length > 0 || open);
  const hasAny =
    navResults.length > 0 || products.length > 0 || collections.length > 0 || liveLoading;

  let runningIndex = -1;

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <MagnifyingGlassIcon className="h-4 w-4 text-[#b5b5b5] group-focus-within:text-white" />
        </div>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search pages, products, collections…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          className="h-8 w-full rounded-full border-0 bg-admin-header-control py-0 pl-8 pr-14 text-sm text-white placeholder:text-[#b5b5b5] transition-colors focus:bg-admin-header-control-hover focus:outline-none focus:ring-1 focus:ring-white/20"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 bg-admin-header-control-hover px-1.5 py-0.5 text-[10px] font-medium text-[#b5b5b5] sm:inline-block">
          Ctrl K
        </kbd>
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1300] mt-1.5 max-h-[min(70vh,520px)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {!hasAny && query.trim() ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No results for “{query.trim()}”
            </div>
          ) : (
            <div className="py-1.5">
              {!query.trim() ? (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Suggested
                </p>
              ) : null}

              {navGroups.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {group}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {items.map((item) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const active = idx === activeIndex;
                      return (
                        <li key={item.id} role="option" aria-selected={active}>
                          <button
                            type="button"
                            className={`flex w-full items-start gap-3 px-3 py-2 text-left transition-colors ${
                              active ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => goTo(item.path)}
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                item.group === 'Actions'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.group === 'Actions' ? (
                                <SparklesIcon className="h-4 w-4" aria-hidden />
                              ) : (
                                <DocumentTextIcon className="h-4 w-4" aria-hidden />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-gray-500">
                                {formatAdminNavBreadcrumb(item)}
                                {item.description && !(item.navPath?.length)
                                  ? ` · ${item.description}`
                                  : ''}
                              </span>
                            </span>
                            <ArrowRightIcon
                              className={`mt-2 h-3.5 w-3.5 shrink-0 ${
                                active ? 'text-blue-500' : 'text-gray-300'
                              }`}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {(products.length > 0 || (liveLoading && debouncedQuery.trim().length >= 2)) && (
                <div className="mb-1 border-t border-gray-100 pt-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Products
                    {liveLoading ? (
                      <span className="ml-1 font-normal normal-case text-gray-300">…</span>
                    ) : null}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {products.map((p) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const active = idx === activeIndex;
                      return (
                        <li key={`p-${p._id}`} role="option" aria-selected={active}>
                          <button
                            type="button"
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                              active ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => goTo(`/products/${p._id}`)}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <CubeIcon className="h-4 w-4 text-gray-500" aria-hidden />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">
                                {p.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-gray-500">
                                Products › {p.title}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {collections.length > 0 && (
                <div className="mb-1 border-t border-gray-100 pt-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Collections
                  </p>
                  <ul className="m-0 list-none p-0">
                    {collections.map((c) => {
                      runningIndex += 1;
                      const idx = runningIndex;
                      const active = idx === activeIndex;
                      return (
                        <li key={`c-${c._id}`} role="option" aria-selected={active}>
                          <button
                            type="button"
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                              active ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => goTo(`/products/collections/${c._id}`)}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                              {c.imageUrl ? (
                                <img
                                  src={c.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <RectangleStackIcon
                                  className="h-4 w-4 text-gray-500"
                                  aria-hidden
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-gray-900">
                                {c.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-gray-500">
                                Products › Collections › {c.title}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
