import { ArrowRightIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <button
        type="button"
        onClick={onPreview}
        className="relative aspect-4/3 overflow-hidden bg-gray-50 text-left"
        aria-label={`Preview ${theme.name}`}
      >
        {theme.thumbnailUrl ? (
          <img
            src={theme.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-50 to-sky-50">
            <PaintBrushIcon className="h-8 w-8 text-sky-500/70" aria-hidden />
            <span className="text-xs font-medium text-gray-500">Theme preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Preview
        </span>
        {isLive ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
            Live
          </span>
        ) : isInstalled ? (
          <span className="absolute right-3 top-3 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100">
            Installed
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">{theme.name}</h3>
          {theme.category ? (
            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {theme.category}
            </span>
          ) : null}
        </div>
        {theme.description ? (
          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500">{theme.description}</p>
        ) : (
          <div className="mb-4" />
        )}

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Preview
          </button>
          {isLive ? (
            <Link
              to="/online-store/themes"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Manage
            </Link>
          ) : (
            <button
              type="button"
              disabled={isInstalling || isInstalled}
              onClick={onInstall}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">Explore More Themes</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Browse catalog themes made for your store. Preview a look you like, then install it in one click.
          </p>
        </div>
        <Link
          to="/online-store/themes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View all themes
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="bg-linear-to-b from-gray-50/80 to-white p-4 sm:p-5">
        {loading && catalogThemes.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="aspect-4/3 animate-pulse bg-gray-100" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : catalogThemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <PaintBrushIcon className="h-8 w-8 text-gray-300" aria-hidden />
            <p className="text-sm text-gray-500">No catalog themes are available yet.</p>
            <Link
              to="/online-store/themes"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
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
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Browse the full theme marketplace
              <ArrowRightIcon className="h-4 w-4 text-gray-400" aria-hidden />
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
