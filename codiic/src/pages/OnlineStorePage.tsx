import {
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../components/admin-list-ui';
import OnlineStoreThemesExplore from '../components/OnlineStoreThemesExplore';
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
      className="relative w-full overflow-hidden rounded-lg border border-admin-border bg-admin-surface"
      style={{ height: CHROME_H + PREVIEW_HEIGHT * scale }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center gap-1.5 border-b border-admin-border bg-admin-secondary px-2.5">
        <span className="h-2 w-2 rounded-full bg-admin-fill" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-admin-fill" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-admin-fill" aria-hidden />
        <span className="ml-2 truncate rounded bg-admin-surface px-2 py-0.5 text-[10px] text-admin-text-subdued ring-1 ring-admin-border">
          {host}
        </span>
      </div>

      {!loaded ? (
        <div className="absolute inset-0 z-1 flex items-center justify-center bg-admin-surface pt-7 text-sm text-admin-text-subdued">
          Loading store…
        </div>
      ) : null}

      <div className="absolute left-0 top-7 overflow-hidden" style={{ width: '100%', height: PREVIEW_HEIGHT * scale }}>
        <iframe
          title="Live storefront preview"
          src={url}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-admin-surface"
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
    <div className={`${adminListPageShellClass} min-h-[calc(100vh-48px)]`}>
      <div className={adminListPageInnerClass}>
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-admin-text">Online store</h1>
            <p className="mt-1 text-sm text-admin-text-secondary">
              {store?.storeName ? `${store.storeName} storefront` : 'Your storefront overview'}
            </p>
          </div>
          {storefrontUrl ? (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={adminListSecondaryButtonClass}
            >
              <span className="max-w-[220px] truncate">{hostLabel}</span>
              <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4 shrink-0 text-admin-text-subdued" aria-hidden />
            </a>
          ) : null}
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <section className={adminListCardClass}>
            <div className="flex items-center justify-between gap-3 border-b border-admin-divider px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-admin-text">Live preview</h2>
                <p className="truncate text-xs text-admin-text-secondary">
                  {hostLabel || 'How your store looks right now'}
                </p>
              </div>
              {storefrontUrl ? (
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 text-xs font-semibold ${adminListFooterLinkClass}`}
                >
                  Open store
                </a>
              ) : null}
            </div>

            <div className="bg-admin-secondary p-3 sm:p-4">
              {loading && !storefrontUrl ? (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-admin-border bg-admin-surface text-sm text-admin-text-subdued">
                  Loading preview…
                </div>
              ) : storefrontUrl ? (
                <StorefrontPreviewFrame url={storefrontUrl} />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-admin-border bg-admin-surface px-6 text-center">
                  <p className="text-sm text-admin-text-secondary">
                    No storefront URL yet. Set up your subdomain to preview the live store.
                  </p>
                  <Link
                    to="/settings/domains"
                    className={`text-sm font-semibold ${adminListFooterLinkClass}`}
                  >
                    Manage domains
                  </Link>
                </div>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <section className={`${adminListCardClass} p-4`}>
              <h2 className="text-sm font-semibold text-admin-text">Current theme</h2>
              {loading && !currentTheme ? (
                <p className="mt-3 text-sm text-admin-text-subdued">Loading…</p>
              ) : currentTheme ? (
                <div className="mt-3">
                  <div className="overflow-hidden rounded-lg border border-admin-divider bg-admin-secondary">
                    {currentTheme.thumbnailUrl ? (
                      <img
                        src={currentTheme.thumbnailUrl}
                        alt=""
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 flex-col items-center justify-center gap-2 bg-admin-fill/40">
                        <PaintBrushIcon className="h-8 w-8 text-admin-text-secondary" aria-hidden />
                        <span className="text-xs font-medium text-admin-text-secondary">
                          {currentTheme.kind === 'custom' ? 'Custom theme' : 'Theme'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-admin-text">{currentTheme.name}</p>
                      {currentTheme.description ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-admin-text-secondary">
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
                      className={`inline-flex flex-1 items-center justify-center ${adminListPrimaryButtonClass}`}
                    >
                      Customize
                    </Link>
                    <Link
                      to="/online-store/themes"
                      className={`inline-flex items-center justify-center ${adminListSecondaryButtonClass}`}
                    >
                      Change
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-admin-text-secondary">No theme is live on this store yet.</p>
                  <Link
                    to="/online-store/themes"
                    className={`mt-3 inline-flex w-full items-center justify-center ${adminListPrimaryButtonClass}`}
                  >
                    Choose a theme
                  </Link>
                </div>
              )}
            </section>

            <section className={adminListCardClass}>
              <div className="border-b border-admin-divider px-4 py-3">
                <h2 className="text-sm font-semibold text-admin-text">Manage</h2>
              </div>
              <ul className="divide-y divide-admin-divider">
                {quickLinks.map(({ to, label, hint, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-admin-row-hover"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-fill text-admin-text-secondary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-admin-text">{label}</span>
                        <span className="block text-xs text-admin-text-secondary">{hint}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <OnlineStoreThemesExplore />
      </div>
    </div>
  );
}
