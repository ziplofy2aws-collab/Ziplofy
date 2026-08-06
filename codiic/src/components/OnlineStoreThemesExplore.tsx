import { ArrowRightIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';
import ThemePreviewModal from './ThemePreviewModal';
import { useInstalledThemes } from '../contexts/installed-themes.context';
import { useStore } from '../contexts/store.context';
import { useThemes, type ThemeItem } from '../contexts/themes.context';

type PreviewState = {
  isOpen: boolean;
  themeId: string;
  themeName: string;
  isInstalled: boolean;
};

const EMPTY_PREVIEW: PreviewState = {
  isOpen: false,
  themeId: '',
  themeName: '',
  isInstalled: false,
};

function ThemeExploreCard({
  theme,
  isInstalled,
  isLive,
  isInstalling,
  onInstall,
  onPreview,
}: {
  theme: ThemeItem;
  isInstalled: boolean;
  isLive: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onPreview: () => void;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface transition-colors hover:border-[#cfcfcf]">
      <button
        type="button"
        onClick={onPreview}
        className="relative aspect-4/3 overflow-hidden bg-admin-secondary text-left"
        aria-label={`Preview ${theme.name}`}
      >
        {theme.thumbnailUrl ? (
          <img
            src={theme.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-admin-fill/40">
            <PaintBrushIcon className="h-8 w-8 text-admin-text-secondary" aria-hidden />
            <span className="text-xs font-medium text-admin-text-secondary">Theme preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-3 left-3 rounded-md bg-admin-surface/95 px-2.5 py-1 text-[11px] font-semibold text-admin-text opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Preview
        </span>
        {isLive ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Live
          </span>
        ) : isInstalled ? (
          <span className="absolute right-3 top-3 rounded-full bg-admin-secondary px-2 py-0.5 text-[11px] font-semibold text-admin-text-secondary ring-1 ring-admin-border">
            Installed
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-admin-text">{theme.name}</h3>
          {theme.category ? (
            <span className="shrink-0 rounded-md bg-admin-fill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-text-secondary">
              {theme.category}
            </span>
          ) : null}
        </div>
        {theme.description ? (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-admin-text-secondary">{theme.description}</p>
        ) : (
          <div className="mb-4" />
        )}

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            className={`inline-flex flex-1 items-center justify-center ${adminListSecondaryButtonClass}`}
          >
            Preview
          </button>
          {isLive ? (
            <Link
              to="/online-store/themes"
              className={`inline-flex flex-1 items-center justify-center ${adminListPrimaryButtonClass}`}
            >
              Manage
            </Link>
          ) : (
            <button
              type="button"
              disabled={isInstalling || isInstalled}
              onClick={onInstall}
              className={`inline-flex flex-1 items-center justify-center ${adminListPrimaryButtonClass}`}
            >
              {isInstalling ? 'Installing…' : isInstalled ? 'Installed' : 'Install'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OnlineStoreThemesExplore() {
  const { activeStoreId } = useStore();
  const { themes, loading, fetchAll } = useThemes();
  const {
    installedThemes,
    installingThemeId,
    installTheme,
    fetchByStoreId,
  } = useInstalledThemes();
  const [preview, setPreview] = useState<PreviewState>(EMPTY_PREVIEW);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const installedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const theme of installedThemes) {
      if (theme._id) ids.add(String(theme._id));
      if (theme.installedThemeId) ids.add(String(theme.installedThemeId));
    }
    return ids;
  }, [installedThemes]);

  const { stores } = useStore();
  const appliedThemeId = useMemo(() => {
    const store = stores.find((s) => s._id === activeStoreId);
    return store?.appliedTheme ? String(store.appliedTheme) : null;
  }, [stores, activeStoreId]);

  const catalogThemes = useMemo(() => themes.slice(0, 8), [themes]);

  const handleInstall = async (themeId: string) => {
    if (!activeStoreId) {
      toast.error('Select a store before installing a theme');
      return;
    }
    await installTheme(activeStoreId, themeId);
    await fetchByStoreId(activeStoreId);
  };

  return (
    <section className={`mt-8 ${adminListCardClass}`}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-admin-divider px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-admin-text">Explore More Themes</h2>
          <p className="mt-1 max-w-2xl text-sm text-admin-text-secondary">
            Browse catalog themes made for your store. Preview a look you like, then install it in one click.
          </p>
        </div>
        <Link
          to="/online-store/themes"
          className={`inline-flex items-center gap-1.5 text-sm font-semibold ${adminListFooterLinkClass}`}
        >
          View all themes
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="bg-admin-secondary/50 p-4 sm:p-5">
        {loading && catalogThemes.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface"
              >
                <div className="aspect-4/3 animate-pulse bg-admin-fill" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-admin-fill" />
                  <div className="h-3 w-full animate-pulse rounded bg-admin-fill" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-admin-fill" />
                </div>
              </div>
            ))}
          </div>
        ) : catalogThemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-admin-border bg-admin-surface px-6 py-12 text-center">
            <PaintBrushIcon className="h-8 w-8 text-admin-text-subdued" aria-hidden />
            <p className="text-sm text-admin-text-secondary">No catalog themes are available yet.</p>
            <Link
              to="/online-store/themes"
              className={`text-sm font-semibold ${adminListFooterLinkClass}`}
            >
              Open themes library
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogThemes.map((theme) => {
              const isInstalled = installedIds.has(String(theme._id));
              const isLive = appliedThemeId === String(theme._id);
              return (
                <ThemeExploreCard
                  key={theme._id}
                  theme={theme}
                  isInstalled={isInstalled}
                  isLive={isLive}
                  isInstalling={installingThemeId === theme._id}
                  onInstall={() => void handleInstall(theme._id)}
                  onPreview={() =>
                    setPreview({
                      isOpen: true,
                      themeId: theme._id,
                      themeName: theme.name,
                      isInstalled,
                    })
                  }
                />
              );
            })}
          </div>
        )}

        {catalogThemes.length > 0 ? (
          <div className="mt-5 flex justify-center">
            <Link
              to="/online-store/themes"
              className={adminListSecondaryButtonClass}
            >
              Browse the full theme marketplace
              <ArrowRightIcon className="ml-2 h-4 w-4 text-admin-text-subdued" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>

      <ThemePreviewModal
        isOpen={preview.isOpen}
        onClose={() => setPreview(EMPTY_PREVIEW)}
        themeId={preview.themeId}
        themeName={preview.themeName}
        isInstalled={preview.isInstalled}
      />
    </section>
  );
}
