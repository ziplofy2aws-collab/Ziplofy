import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstalledThemes } from '../contexts/installed-themes.context';
import { useStore } from '../contexts/store.context';
import { useStoreCustomThemes } from '../contexts/store-custom-themes.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { normalizeStorefrontOrigin } from '../utils/storefront-url.util';

const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 800;
const CHROME_H = 28;

function displayHost(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return u.host + (u.pathname === '/' ? '' : u.pathname.replace(/\/$/, ''));
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

function StorefrontPreviewFrame({ url }: { url: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [loaded, setLoaded] = useState(false);
  const host = displayHost(url);

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / PREVIEW_WIDTH);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={shellRef}
      className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-inner"
      style={{ height: CHROME_H + PREVIEW_HEIGHT * scale }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-1.5 border-b border-gray-200 bg-gray-100 px-2.5">
        <span className="h-2 w-2 rounded-full bg-gray-300" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-gray-300" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-gray-300" aria-hidden />
        <span className="ml-2 truncate rounded bg-white px-2 py-0.5 text-[10px] text-gray-500 ring-1 ring-gray-200">
          {host}
        </span>
      </div>

      {!loaded ? (
        <div className="absolute inset-0 z-1 flex items-center justify-center bg-white pt-7 text-sm text-gray-400">
          Loading store…
        </div>
      ) : null}

      <div className="absolute left-0 top-7 overflow-hidden" style={{ width: '100%', height: PREVIEW_HEIGHT * scale }}>
        <iframe
          title="Live storefront preview"
          src={url}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
          }}
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

export default function OnlineStorePage() {
  const { activeStoreId, stores } = useStore();
  const { storeSubdomain, loading: subdomainLoading, getByStoreId } = useStoreSubdomain();
  const { installedThemes, loading: installedLoading, fetchByStoreId } = useInstalledThemes();
  const {
    themes: storeCustomThemes,
    loading: customLoading,
    getByStoreId: fetchStoreCustomThemes,
  } = useStoreCustomThemes();

  const store = useMemo(
    () => stores.find((s) => s._id === activeStoreId) ?? null,
    [stores, activeStoreId]
  );

  const appliedThemeId = store?.appliedTheme ? String(store.appliedTheme) : null;
  const appliedCustomThemeId = store?.appliedCustomThemeId
    ? String(store.appliedCustomThemeId)
    : null;

  useEffect(() => {
    if (!activeStoreId) return;
    void getByStoreId(activeStoreId);
    void fetchByStoreId(activeStoreId);
    void fetchStoreCustomThemes(activeStoreId).catch(() => undefined);
  }, [activeStoreId, getByStoreId, fetchByStoreId, fetchStoreCustomThemes]);

  const storefrontUrl = useMemo(
    () => normalizeStorefrontOrigin(storeSubdomain?.url) || null,
    [storeSubdomain?.url]
  );

  const currentTheme = useMemo(() => {
    if (appliedCustomThemeId) {
      const custom = storeCustomThemes.find((t) => String(t._id) === appliedCustomThemeId);
      if (custom) {
        return {
          kind: 'custom' as const,
          name: custom.themeName,
          description: custom.themeDesc ?? '',
          thumbnailUrl: null as string | null,
          editPath: `/themes/create?id=${custom._id}`,
        };
      }
    }

    if (appliedThemeId) {
      const installed = installedThemes.find(
        (t) =>
          String(t.installedThemeId) === appliedThemeId || String(t._id) === appliedThemeId
      );
      if (installed) {
        return {
          kind: installed.isCustomTheme ? ('legacy-custom' as const) : ('catalog' as const),
          name: installed.name,
          description: installed.description ?? '',
          thumbnailUrl: installed.thumbnailUrl ?? null,
          editPath: `/themes/create?id=${installed.installedThemeId || installed._id}`,
        };
      }
    }

    return null;
  }, [appliedCustomThemeId, appliedThemeId, storeCustomThemes, installedThemes]);

  const loading = subdomainLoading || installedLoading || customLoading;
  const hostLabel = displayHost(storefrontUrl);

  const quickLinks = [
    {
      to: '/online-store/themes',
      label: 'Themes',
      hint: 'Browse, install, and customize',
      icon: SwatchIcon,
    },
    {
      to: '/online-store/pages',
      label: 'Pages',
      hint: 'About, contact, and static pages',
      icon: DocumentTextIcon,
    },
    {
      to: '/online-store/preference',
      label: 'Preference',
      hint: 'Password, SEO, and access',
      icon: Cog6ToothIcon,
    },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Online store</h1>
            <p className="mt-1 text-sm text-gray-500">
              {store?.storeName ? `${store.storeName} storefront` : 'Your storefront overview'}
            </p>
          </div>
          {storefrontUrl ? (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <span className="max-w-[220px] truncate">{hostLabel}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            </a>
          ) : null}
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">Live preview</h2>
                <p className="truncate text-xs text-gray-500">
                  {hostLabel || 'How your store looks right now'}
                </p>
              </div>
              {storefrontUrl ? (
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Open store
                </a>
              ) : null}
            </div>

            <div className="bg-gray-50 p-3 sm:p-4">
              {loading && !storefrontUrl ? (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-400">
                  Loading preview…
                </div>
              ) : storefrontUrl ? (
                <StorefrontPreviewFrame url={storefrontUrl} />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white px-6 text-center">
                  <p className="text-sm text-gray-500">
                    No storefront URL yet. Set up your subdomain to preview the live store.
                  </p>
                  <Link
                    to="/settings/domains"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Manage domains
                  </Link>
                </div>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Current theme</h2>
              {loading && !currentTheme ? (
                <p className="mt-3 text-sm text-gray-400">Loading…</p>
              ) : currentTheme ? (
                <div className="mt-3">
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {currentTheme.thumbnailUrl ? (
                      <img
                        src={currentTheme.thumbnailUrl}
                        alt=""
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-50 to-blue-50">
                        <PaintBrushIcon className="h-8 w-8 text-blue-500/70" aria-hidden />
                        <span className="text-xs font-medium text-gray-500">
                          {currentTheme.kind === 'custom' ? 'Custom theme' : 'Theme'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{currentTheme.name}</p>
                      {currentTheme.description ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {currentTheme.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Live
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={currentTheme.editPath}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Customize
                    </Link>
                    <Link
                      to="/online-store/themes"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Change
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">No theme is live on this store yet.</p>
                  <Link
                    to="/online-store/themes"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Choose a theme
                  </Link>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Manage</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {quickLinks.map(({ to, label, hint, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{hint}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
