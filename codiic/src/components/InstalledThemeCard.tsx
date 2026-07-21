import {
  ArrowDownTrayIcon,
  EyeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import React from 'react';

interface InstalledThemeCardProps {
  theme: any;
  onUninstall: (themeId: string) => void;
}

const InstalledThemeCard: React.FC<InstalledThemeCardProps> = ({ theme, onUninstall }) => {
  const t = theme.themeId || {};

  return (
    <div className="bg-white border border-gray-200 rounded-lg transition-colors relative flex flex-col hover:bg-gray-50 group">
      <div className="relative w-full h-[160px] overflow-hidden bg-gray-50">
        <img
          src={t.thumbnailUrl || ''}
          alt={t.name || ''}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="150" y="100" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="14">No Preview</text></svg>';
          }}
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-white rounded bg-transparent text-white text-xs font-medium cursor-pointer transition-colors hover:bg-white hover:text-gray-900">
            <EyeIcon className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-white rounded bg-transparent text-white text-xs font-medium cursor-pointer transition-colors hover:bg-white hover:text-gray-900">
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 m-0 capitalize">{t.name}</h3>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-3 h-3 text-orange-500 fill-current" />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">{Number((t as any).rating?.average || 0).toFixed(1)}</span>
          </div>
        </div>

        {t.description && <p className="text-xs text-gray-600 m-0 mb-3 leading-snug capitalize line-clamp-2">{t.description}</p>}

        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded capitalize font-medium">{t.category}</span>
          <span className="text-xs font-medium text-green-600">Free</span>
        </div>

        <div className="flex gap-2 flex-col">
          <button className="w-full px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors text-center bg-gray-900 text-white border border-gray-900 hover:bg-gray-800">
            Open
          </button>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors text-center bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
              Preview
            </button>
            <button className="flex-1 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors text-center bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" onClick={() => onUninstall(theme._id)}>
              Uninstall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstalledThemeCard;

