import {
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import React, { useCallback } from 'react';

export interface ThemeCardTheme {
  _id: string;
  name: string;
  description?: string | null;
  category: string;
  thumbnailUrl?: string | null;
  rating?: {
    average?: number;
  } | null;
}

interface ThemeCardProps {
  theme: ThemeCardTheme;
  installedThemes: any[];
  installingThemeId?: string | null;
  onInstallClick: (themeId: string) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  installedThemes,
  installingThemeId = null,
  onInstallClick,
}) => {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><text x="200" y="155" text-anchor="middle" fill="#9ca3af" font-family="system-ui,sans-serif" font-size="14">Preview</text></svg>'
      );
  }, []);

  const isInstalled =
    Array.isArray(installedThemes) &&
    installedThemes.some((it: { _id?: string; themeId?: { _id?: string } }) =>
      String(it._id ?? it.themeId?._id) === String(theme._id)
    );
  const isInstalling = installingThemeId != null && String(installingThemeId) === String(theme._id);

  const avg = Number(theme?.rating?.average ?? 0);
  const fullStars = Math.min(5, Math.max(0, Math.round(avg)));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200/90 hover:shadow-md hover:shadow-blue-500/[0.08]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-gray-50">
        <img
          src={theme?.thumbnailUrl || ''}
          alt={theme?.name ? `${theme.name} preview` : 'Theme preview'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={handleImageError}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
          >
            <EyeIcon className="h-3.5 w-3.5" aria-hidden />
            Preview
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden />
            Details
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold capitalize tracking-tight text-gray-900">
            {theme?.name}
          </h3>
          {theme?.category ? (
            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {theme.category}
            </span>
          ) : null}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-center gap-0.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <StarSolid
                key={i}
                className={`h-3.5 w-3.5 ${i < fullStars ? 'text-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold tabular-nums text-gray-800">{avg.toFixed(1)}</span>
          <span className="text-xs font-semibold text-emerald-600">Free</span>
        </div>

        {theme?.description ? (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">{theme.description}</p>
        ) : (
          <div className="mb-3" />
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            disabled={isInstalled || isInstalling}
            onClick={() => onInstallClick(theme._id)}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInstalling ? 'Installing…' : isInstalled ? 'Installed' : 'Install theme'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              View demo
            </button>
            {isInstalled ? (
              <button
                type="button"
                className="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-2 text-xs font-semibold text-gray-400"
                disabled
              >
                Installed
              </button>
            ) : (
              <button
                type="button"
                disabled={isInstalling}
                onClick={() => onInstallClick(theme._id)}
                className="rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-800 transition-colors hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isInstalling ? 'Installing…' : 'Install'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThemeCard;
