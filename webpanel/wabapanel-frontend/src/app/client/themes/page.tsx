'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  LayoutTemplate,
  Loader2,
  Paintbrush,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  INFORMATIC_THEME_EDITOR_DEV_ROUTE,
  THEME_EDITOR_STATIC_CONFIG,
  isStaticInformaticThemeEditorMode,
} from '@/config/informatic-theme-editor-static.config';
import { adminContentColumnClass, adminListPrimaryButtonClass } from '@/components/layout/dashboard-ui';
import { InformaticThemePreviewModal } from '@/components/themes/InformaticThemePreviewModal';
import {
  informaticInstalledThemesApi,
  informaticThemesApi,
  type InformaticInstalledThemeItem,
  type InformaticThemeCatalogItem,
} from '@/lib/api';
import { useStoreStore, selectActiveStore } from '@/stores/storeStore';

type ThemesTab = 'available' | 'installed';

type AvailableThemeItem = {
  id: string;
  name: string;
  description: string;
  version: string;
  kind: 'informatic-local' | 'informatic-catalog';
  badges: string[];
  thumbnailUrl?: string | null;
  plan?: string;
  contentFileCount?: number;
};

const PLACEHOLDER_THUMB =
  'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #172554 100%)';

function buildLocalDevTheme(staticMode: boolean): AvailableThemeItem[] {
  if (!staticMode) return [];
  return [
    {
      id: THEME_EDITOR_STATIC_CONFIG.themeId,
      name: 'Informatic (local dev)',
      description:
        'Content / information site theme — local pack from remote-themes/informatic.',
      version: '0.1.0',
      kind: 'informatic-local',
      badges: ['Local', 'Dev', 'Informatic'],
    },
  ];
}

function mapCatalogTheme(theme: InformaticThemeCatalogItem): AvailableThemeItem {
  return {
    id: theme.id || theme._id,
    name: theme.name,
    description: theme.description || 'Informatic content theme from catalog.',
    version: theme.version || '1.0.0',
    kind: 'informatic-catalog',
    badges: ['Catalog', 'Informatic', ...(theme.hasRemoteTheme ? ['Remote'] : [])],
    thumbnailUrl: theme.thumbnailUrl,
    plan: theme.plan,
    contentFileCount: theme.contentFileCount,
  };
}

function editorHrefForTheme(themeId: string): string {
  return `${INFORMATIC_THEME_EDITOR_DEV_ROUTE}?catalogThemeId=${encodeURIComponent(themeId)}`;
}

function ThemeBadges({ badges, overlay }: { badges: string[]; overlay?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${overlay ? 'absolute left-3 top-3' : ''}`}>
      {badges.slice(0, 3).map((b) => (
        <span
          key={b}
          className={
            overlay
              ? 'rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm'
              : `rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  b === 'Dev'
                    ? 'bg-amber-300/95 text-amber-950'
                    : b === 'Catalog'
                      ? 'bg-emerald-300/95 text-emerald-950'
                      : b === 'Local'
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-400/90 text-blue-950'
                }`
          }
        >
          {b}
        </span>
      ))}
    </div>
  );
}

function ThemeThumbnail({
  theme,
}: {
  theme: { name: string; badges: string[]; thumbnailUrl?: string | null };
}) {
  if (theme.thumbnailUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={theme.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        <ThemeBadges badges={theme.badges} overlay />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      style={{ background: PLACEHOLDER_THUMB }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
        <ThemeBadges badges={theme.badges} />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200">
            Informatic theme
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{theme.name}</p>
        </div>
      </div>
    </div>
  );
}

/** Themes list — Available (Preview + Install) and Installed (Customize). */
export default function ThemesPage() {
  const staticMode = isStaticInformaticThemeEditorMode();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const activeStoreId = activeStore?._id || null;

  const [activeTab, setActiveTab] = useState<ThemesTab>('available');
  const [catalogThemes, setCatalogThemes] = useState<InformaticThemeCatalogItem[]>([]);
  const [installedThemes, setInstalledThemes] = useState<InformaticInstalledThemeItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingInstalled, setLoadingInstalled] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [installingThemeId, setInstallingThemeId] = useState<string | null>(null);
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null);
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    themeId: string;
    themeName: string;
  }>({ isOpen: false, themeId: '', themeName: '' });

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setLoadError(null);
    try {
      const res = await informaticThemesApi.list({ limit: 48 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCatalogThemes(res.data.data);
      } else {
        setCatalogThemes([]);
        setLoadError('Could not load themes from catalog.');
      }
    } catch (e) {
      setCatalogThemes([]);
      setLoadError((e as Error)?.message || 'Failed to fetch Informatic themes.');
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const loadInstalled = useCallback(async () => {
    if (!activeStoreId) {
      setInstalledThemes([]);
      return;
    }
    setLoadingInstalled(true);
    try {
      const res = await informaticInstalledThemesApi.list(activeStoreId);
      setInstalledThemes(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setInstalledThemes([]);
    } finally {
      setLoadingInstalled(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    void loadInstalled();
  }, [loadInstalled]);

  const installedThemeIds = useMemo(
    () => new Set(installedThemes.map((t) => t.informaticThemeId)),
    [installedThemes]
  );

  const availableThemes = useMemo(() => {
    const local = buildLocalDevTheme(staticMode);
    const remote = catalogThemes.map(mapCatalogTheme);
    return [...local, ...remote];
  }, [catalogThemes, staticMode]);

  const openPreview = (themeId: string, themeName: string) => {
    setPreviewModal({ isOpen: true, themeId, themeName });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, themeId: '', themeName: '' });
  };

  const handleInstall = async (themeId: string) => {
    if (!activeStoreId) {
      window.alert('Select a store before installing a theme.');
      return;
    }
    if (installedThemeIds.has(themeId)) return;

    setInstallingThemeId(themeId);
    try {
      const res = await informaticInstalledThemesApi.install(activeStoreId, themeId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInstalledThemes(res.data.data);
      } else {
        await loadInstalled();
      }
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to install theme';
      window.alert(msg);
    } finally {
      setInstallingThemeId(null);
    }
  };

  const handleUninstall = async (installedThemeId: string) => {
    if (!activeStoreId) return;
    if (!window.confirm('Uninstall this theme? Saved customizations will remain until you delete them.')) {
      return;
    }

    setUninstallingId(installedThemeId);
    try {
      const res = await informaticInstalledThemesApi.uninstall(activeStoreId, installedThemeId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInstalledThemes(res.data.data);
      } else {
        await loadInstalled();
      }
      await fetchStores();
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to uninstall theme';
      window.alert(msg);
    } finally {
      setUninstallingId(null);
    }
  };

  const handleApply = async (themeId: string) => {
    if (!activeStoreId) {
      window.alert('Select a store before applying a theme.');
      return;
    }

    setApplyingThemeId(themeId);
    try {
      const res = await informaticInstalledThemesApi.apply(activeStoreId, themeId);
      if (res.data?.success) {
        if (Array.isArray(res.data.data?.installedThemes)) {
          setInstalledThemes(res.data.data.installedThemes);
        } else {
          await loadInstalled();
        }
        await fetchStores();
      } else {
        window.alert(res.data?.message || 'Failed to apply theme');
      }
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        'Failed to apply theme';
      window.alert(msg);
    } finally {
      setApplyingThemeId(null);
    }
  };

  const openCustomize = (themeId: string) => {
    window.open(editorHrefForTheme(themeId), '_blank', 'noopener,noreferrer');
  };

  const refreshAll = () => {
    void loadCatalog();
    void loadInstalled();
  };

  return (
    <div className={`${adminContentColumnClass} space-y-5`}>
      {staticMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-secondary px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-admin-text">Static Informatic theme editor</p>
            <p className="mt-0.5 text-xs text-admin-text-secondary">
              Dev Editor mode is active — local pack from{' '}
              <code className="rounded bg-admin-fill px-1">remote-themes/informatic</code>.
            </p>
          </div>
          <Link
            href={INFORMATIC_THEME_EDITOR_DEV_ROUTE}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 ${adminListPrimaryButtonClass}`}
          >
            Open local editor
          </Link>
        </div>
      ) : null}

      {!activeStoreId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the header to install themes and save customizations.
        </div>
      ) : (
        <div className="rounded-lg border border-admin-border bg-admin-secondary px-4 py-3 text-[13px] text-admin-text-secondary">
          Active store:{' '}
          <strong className="text-admin-text">{activeStore?.storeName || activeStoreId}</strong>
        </div>
      )}

      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Themes</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Preview catalog themes, install to your store, then customize from the Installed tab.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          disabled={loadingCatalog || loadingInstalled}
          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary disabled:opacity-60"
        >
          {loadingCatalog || loadingInstalled ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </header>

      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          {loadError} Ensure codiic-server is running and{' '}
          <code className="rounded bg-white/70 px-1">CODIIC_API_URL</code> is set on wabapanel-express.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
        <div className="flex gap-1 border-b border-admin-border px-2 pt-2 sm:px-3">
          {(
            [
              { id: 'available' as const, label: 'Available', count: availableThemes.length },
              { id: 'installed' as const, label: 'Installed', count: installedThemes.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-black text-admin-text'
                  : 'border-transparent text-admin-text-secondary hover:text-admin-text'
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-admin-secondary px-1.5 py-0.5 text-[11px] font-semibold text-admin-text-secondary">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-[#fafafa] p-4 sm:p-5">
          {activeTab === 'available' ? (
            loadingCatalog && availableThemes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-admin-border bg-white px-6 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-admin-text-secondary" aria-hidden />
                <p className="mt-3 text-sm font-medium text-admin-text">Loading themes…</p>
              </div>
            ) : availableThemes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableThemes.map((theme) => {
                  const isInstalled = installedThemeIds.has(theme.id);
                  const isLocal = theme.kind === 'informatic-local';
                  const isInstalling = installingThemeId === theme.id;

                  return (
                    <article
                      key={theme.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                    >
                      <ThemeThumbnail theme={theme} />

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="truncate text-[14px] font-semibold text-admin-text">
                              {theme.name}
                            </h2>
                            {isLocal ? (
                              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                Dev
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-green-700">
                                {theme.plan || 'catalog'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-admin-text-secondary">
                            {theme.description}
                          </p>
                          <p className="mt-2 text-[11px] text-admin-text-secondary">
                            v{theme.version} · react-remote
                          </p>
                        </div>

                        <div className="mt-auto flex flex-wrap gap-2">
                          {!isLocal ? (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary"
                                onClick={() => openPreview(theme.id, theme.name)}
                              >
                                <Eye className="h-3.5 w-3.5" aria-hidden />
                                Preview
                              </button>
                              {isInstalled ? (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] font-medium text-green-800"
                                >
                                  Installed
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isInstalling || !activeStoreId}
                                  className={`${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`}
                                  onClick={() => void handleInstall(theme.id)}
                                >
                                  {isInstalling ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Download className="h-3.5 w-3.5" aria-hidden />
                                  )}
                                  {isInstalling ? 'Installing…' : 'Install'}
                                </button>
                              )}
                            </>
                          ) : (
                            <Link
                              href={INFORMATIC_THEME_EDITOR_DEV_ROUTE}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`}
                            >
                              <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
                              Open dev editor
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-admin-border bg-white px-6 py-12 text-center">
                <Paintbrush className="mx-auto h-8 w-8 text-admin-text-secondary" aria-hidden />
                <p className="mt-3 text-sm font-medium text-admin-text">No themes yet</p>
                <p className="mt-1 text-[13px] text-admin-text-secondary">
                  Upload Informatic themes from the Codiic admin panel under{' '}
                  <strong>Developer → Informatic Themes</strong>, then refresh this page.
                </p>
              </div>
            )
          ) : loadingInstalled && installedThemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-admin-border bg-white px-6 py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-admin-text-secondary" aria-hidden />
              <p className="mt-3 text-sm font-medium text-admin-text">Loading installed themes…</p>
            </div>
          ) : installedThemes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {installedThemes.map((theme) => {
                const isUninstalling = uninstallingId === theme.installedThemeId;
                const isApplying = applyingThemeId === theme.informaticThemeId;
                const isApplied =
                  activeStore?.appliedTheme != null &&
                  String(activeStore.appliedTheme) === String(theme.informaticThemeId);

                return (
                  <article
                    key={theme.installedThemeId}
                    className="flex flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                  >
                    <ThemeThumbnail
                      theme={{
                        name: theme.name,
                        badges: ['Installed', 'Informatic'],
                        thumbnailUrl: theme.thumbnailUrl,
                      }}
                    />

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="truncate text-[14px] font-semibold text-admin-text">
                            {theme.name}
                          </h2>
                          {isApplied ? (
                            <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                              Live
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-admin-text-secondary">
                          {theme.description || 'Installed Informatic theme'}
                        </p>
                        <p className="mt-2 text-[11px] text-admin-text-secondary">
                          v{theme.version || '1.0.0'}
                          {theme.installedAt
                            ? ` · installed ${new Date(theme.installedAt).toLocaleDateString()}`
                            : ''}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2">
                        {!isApplied ? (
                          <button
                            type="button"
                            disabled={isApplying || isUninstalling}
                            className={`${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`}
                            onClick={() => void handleApply(theme.informaticThemeId)}
                          >
                            {isApplying ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {isApplying ? 'Applying…' : 'Apply'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={
                            isApplied
                              ? `${adminListPrimaryButtonClass} inline-flex items-center gap-1.5`
                              : 'inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary'
                          }
                          onClick={() => openCustomize(theme.informaticThemeId)}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Customize
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text hover:bg-admin-secondary"
                          onClick={() => openPreview(theme.informaticThemeId, theme.name)}
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          Preview
                        </button>
                        <button
                          type="button"
                          disabled={isUninstalling}
                          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-[13px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                          onClick={() => void handleUninstall(theme.installedThemeId)}
                        >
                          {isUninstalling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                          Uninstall
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-admin-border bg-white px-6 py-12 text-center">
              <Download className="mx-auto h-8 w-8 text-admin-text-secondary" aria-hidden />
              <p className="mt-3 text-sm font-medium text-admin-text">No installed themes</p>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                Browse the Available tab, preview a theme, then click Install.
              </p>
              <button
                type="button"
                className="mt-4 text-[13px] font-semibold text-admin-text underline-offset-2 hover:underline"
                onClick={() => setActiveTab('available')}
              >
                Browse available themes
              </button>
            </div>
          )}
        </div>
      </div>

      <InformaticThemePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        themeId={previewModal.themeId}
        themeName={previewModal.themeName}
      />
    </div>
  );
}
