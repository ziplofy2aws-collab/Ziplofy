'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  LayoutDashboard,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import { adminHeaderSearchClass } from '@/components/layout/admin-header';
import { filterClientNavCatalog } from '@/lib/filter-client-nav';
import {
  groupClientNavResults,
  searchClientNavCatalog,
} from '@/lib/client-nav-search';
import {
  formatNavBreadcrumb,
  type ClientNavSearchItem,
} from '@/lib/client-nav-catalog';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const resultRowClass = (active: boolean) =>
  `flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors rounded-lg mx-1 ${
    active ? 'bg-[#f6f6f7]' : 'hover:bg-[#f6f6f7]'
  }`;

const sectionLabelClass =
  'px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]';

type ClientGlobalSearchProps = {
  className?: string;
  inputClassName?: string;
  mobileIconOnly?: boolean;
};

export default function ClientGlobalSearch({
  className = '',
  inputClassName = '',
  mobileIconOnly = false,
}: ClientGlobalSearchProps) {
  const router = useRouter();
  const listId = useId();
  const { user, features } = useAuthStore();
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 150);

  const catalog = useMemo(
    () =>
      filterClientNavCatalog({
        user: user as { role?: string; permissions?: string[]; allowedChannels?: string[] } | null,
        features: features ?? {},
      }),
    [user, features]
  );

  const results = useMemo(
    () => searchClientNavCatalog(catalog, debouncedQuery, 16),
    [catalog, debouncedQuery]
  );

  const groups = useMemo(() => groupClientNavResults(results), [results]);
  const flatResults = results;
  const showPanel = open;

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, results.length]);

  useEffect(() => {
    if (!showPanel || !panelRef.current) return;
    const active = panelRef.current.querySelector('[aria-selected="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, showPanel]);

  const close = useCallback(() => {
    setOpen(false);
    setMobileExpanded(false);
    setActiveIndex(0);
    inputRef.current?.blur();
  }, []);

  const goTo = useCallback(
    (href: string) => {
      router.push(href);
      setQuery('');
      close();
    },
    [router, close]
  );

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [close, open]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const isMetaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isMetaK) {
        e.preventDefault();
        setOpen(true);
        setMobileExpanded(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
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
      if (hit) goTo(hit.href);
    }
  };

  const renderResult = (item: ClientNavSearchItem, idx: number) => {
    const active = idx === activeIndex;
    const title = t(item.title);
    const breadcrumb = formatNavBreadcrumb({
      ...item,
      title: t(item.title),
      navPath: item.navPath.map((p) => t(p)),
    });

    return (
      <li key={item.id} role="option" aria-selected={active}>
        <button
          type="button"
          className={resultRowClass(active)}
          onMouseEnter={() => setActiveIndex(idx)}
          onClick={() => goTo(item.href)}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1] text-[#616161]">
            {item.section === 'Inbox' ? (
              <MessageSquare className="h-4 w-4" aria-hidden />
            ) : item.title === 'Dashboard' ? (
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[#303030]">{title}</span>
            <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{breadcrumb}</span>
          </span>
          <ArrowRight
            className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#616161]' : 'text-[#e3e3e3]'}`}
            aria-hidden
          />
        </button>
      </li>
    );
  };

  const searchInput = (
    <div className="group relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b5b5b5] group-focus-within:text-white" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Search pages, sections, tools…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKeyDown}
        className={`${adminHeaderSearchClass} ${inputClassName}`}
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 bg-[#262626] px-1.5 py-0.5 text-[10px] font-medium text-[#b5b5b5] sm:inline-block">
        Ctrl K
      </kbd>
    </div>
  );

  const renderResultsList = () => {
    let runningIndex = -1;
    return groups.map(({ section, items }) => (
      <div key={section} className="mb-1">
        {query.trim() ? <p className={sectionLabelClass}>{t(section)}</p> : null}
        <ul className="m-0 list-none p-0">
          {items.map((item) => {
            runningIndex += 1;
            return renderResult(item, runningIndex);
          })}
        </ul>
      </div>
    ));
  };

  const renderPanelBody = () => (
    <>
      {!query.trim() ? (
        <p className={`${sectionLabelClass} pb-1 pt-2`}>Suggested</p>
      ) : null}

      {!flatResults.length && query.trim() ? (
        <div className="px-4 py-8 text-center text-[13px] text-[#8a8a8a]">
          No results for &ldquo;{query.trim()}&rdquo;
        </div>
      ) : (
        <div className="py-1">{renderResultsList()}</div>
      )}

      <div className="border-t border-[#ebebeb] px-3 py-2 text-[11px] text-[#8a8a8a]">
        <span className="hidden sm:inline">↑↓ navigate · Enter open · Esc close</span>
        <span className="sm:hidden">Tap a result to open</span>
      </div>
    </>
  );

  const resultsPanel = showPanel ? (
    <div
      ref={panelRef}
      id={listId}
      role="listbox"
      className="admin-header-dropdown absolute left-0 right-0 top-full z-[1300] mt-1.5 max-h-[min(70vh,480px)] overflow-y-auto rounded-xl border border-[#e3e3e3] bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
    >
      {renderPanelBody()}
    </div>
  ) : null;

  const mobileResultsPanel = showPanel && mobileExpanded ? (
    <div
      id={`${listId}-mobile`}
      role="listbox"
      className="max-h-[min(65vh,420px)] overflow-y-auto bg-white py-1.5"
    >
      {renderPanelBody()}
    </div>
  ) : null;

  return (
    <>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              aria-hidden
              /* Keep left rail clickable — sidebar sits at z-[1100]; do not cover it. */
              className="fixed inset-0 z-[1090] bg-black/25 transition-opacity lg:left-[240px]"
              onMouseDown={() => {
                close();
              }}
            />,
            document.body
          )
        : null}

      <div ref={rootRef} className={`relative z-[1202] w-full ${className}`}>
        {mobileIconOnly ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMobileExpanded(true);
                setOpen(true);
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="admin-header-control inline-flex items-center justify-center rounded-lg p-2 md:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-[#b5b5b5]" />
            </button>
            {mobileExpanded && (
              <div className="fixed inset-x-3 top-[3.75rem] z-[1300] md:hidden">
                <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
                  <div className="border-b border-[#ebebeb] bg-black p-2">{searchInput}</div>
                  {mobileResultsPanel}
                </div>
              </div>
            )}
            <div className="hidden md:block">{searchInput}</div>
            <div className="hidden md:block">{resultsPanel}</div>
          </>
        ) : (
          <>
            {searchInput}
            {resultsPanel}
          </>
        )}
      </div>
    </>
  );
}
