'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Paintbrush,
  Store,
} from 'lucide-react';
import {
  adminContentColumnClass,
  adminListPrimaryButtonClass,
} from '@/components/layout/dashboard-ui';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';
import {
  buildStorefrontUrl,
  displayStorefrontHost,
} from '@/lib/storefront-url';
import {
  INFORMATIC_THEME_EDITOR_DEV_ROUTE,
  isStaticInformaticThemeEditorMode,
} from '@/config/informatic-theme-editor-static.config';

export default function OnlineStorePage() {
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const loading = useStoreStore((s) => s.loading);
  const activeStore = useStoreStore(selectActiveStore);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const storefrontUrl = useMemo(() => {
    if (!activeStore?.subdomain) return null;
    return buildStorefrontUrl(
      activeStore.subdomain.subdomain,
      activeStore.subdomain.customDomain
    );
  }, [activeStore]);

  const hostLabel = displayStorefrontHost(storefrontUrl);
  const staticMode = isStaticInformaticThemeEditorMode();

  const copyLink = async () => {
    if (!storefrontUrl) return;
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const openEditor = () => {
    window.open(INFORMATIC_THEME_EDITOR_DEV_ROUTE, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`${adminContentColumnClass} space-y-5`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Online store</h1>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {activeStore?.storeName
              ? `${activeStore.storeName} storefront`
              : 'Select a store from the account menu'}
          </p>
        </div>

        {storefrontUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              {hostLabel}
            </a>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        ) : null}
      </header>

      {loading && !activeStore ? (
        <p className="text-[13px] text-admin-text-secondary">Loading store…</p>
      ) : !activeStore ? (
        <div className="rounded-xl border border-dashed border-admin-border bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-admin-text">No store yet</p>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Create a store from the account menu (under Wallet → Create new store).
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          {/* Preview / storefront card */}
          <section className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
            <div className="flex items-center gap-1.5 border-b border-admin-border bg-[#f7f7f7] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#d1d1d1]" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-[#d1d1d1]" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-[#d1d1d1]" aria-hidden />
              <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[11px] text-admin-text-secondary ring-1 ring-admin-border">
                {hostLabel || 'No subdomain assigned'}
              </span>
            </div>
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-10 text-center">
              <Store className="h-10 w-10 text-slate-400" aria-hidden />
              <div>
                <p className="text-[15px] font-semibold text-admin-text">{activeStore.storeName}</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  {storefrontUrl
                    ? 'Your Informatic website link is ready. Open it or customize the theme.'
                    : 'Subdomain is missing — create/reopen this store to allocate one.'}
                </p>
              </div>
              {storefrontUrl ? (
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`}
                >
                  Open store
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </section>

          {/* Current theme + manage */}
          <div className="space-y-4">
            <section className="rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-[13px] font-semibold text-admin-text">Current theme</h2>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  Live
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-admin-border bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4 text-white">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-blue-200">
                  Informatic
                </p>
                <p className="mt-1 text-[15px] font-semibold">Informatic</p>
                <p className="mt-1 text-[12px] text-slate-200/90">Content / information site theme</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {staticMode ? (
                  <button
                    type="button"
                    onClick={openEditor}
                    className={`${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`}
                  >
                    <Paintbrush className="h-3.5 w-3.5" aria-hidden />
                    Customize
                  </button>
                ) : null}
                <Link
                  href="/client/themes"
                  className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary"
                >
                  Change theme
                </Link>
              </div>
            </section>

            <section className="rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <h2 className="mb-2 text-[13px] font-semibold text-admin-text">Store link</h2>
              <p className="break-all rounded-lg bg-admin-secondary px-3 py-2 font-mono text-[12px] text-admin-text">
                {storefrontUrl || '—'}
              </p>
              <p className="mt-2 text-[11px] text-admin-text-secondary">
                Dev uses <code className="rounded bg-admin-fill px-1">.localhost:3003</code>. Production uses{' '}
                <code className="rounded bg-admin-fill px-1">.crm-360.codiic.com</code>.
              </p>
            </section>

            <section className="rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <h2 className="mb-2 text-[13px] font-semibold text-admin-text">Manage</h2>
              <ul className="space-y-1 text-[13px]">
                <li>
                  <Link href="/client/online-store/blogs" className="font-medium text-[#005bd3] hover:underline">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/client/online-store/pages" className="font-medium text-[#005bd3] hover:underline">
                    Pages
                  </Link>
                </li>
                <li>
                  <Link href="/client/online-store/menus" className="font-medium text-[#005bd3] hover:underline">
                    Menus
                  </Link>
                </li>
                <li>
                  <Link href="/client/online-store/policies" className="font-medium text-[#005bd3] hover:underline">
                    Policies
                  </Link>
                </li>
                <li>
                  <Link href="/client/online-store/media-library" className="font-medium text-[#005bd3] hover:underline">
                    Media library
                  </Link>
                </li>
                <li>
                  <Link href="/client/themes" className="font-medium text-[#005bd3] hover:underline">
                    Themes
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
