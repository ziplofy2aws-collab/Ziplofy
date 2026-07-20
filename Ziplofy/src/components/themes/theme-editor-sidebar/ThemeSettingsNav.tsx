import { ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { THEME_SETTINGS_CATALOG } from './theme-settings-catalog';

/** Flat Shopify-style theme settings list (labels only; no panel wiring yet). */
export function ThemeSettingsNav() {
  return (
    <nav className="pb-2" aria-label="Theme settings">
      {THEME_SETTINGS_CATALOG.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.infoOnly}
          className={`flex w-full items-center justify-between gap-3 border-b border-[#e1e1e1] px-3 py-3.5 text-left text-[15px] transition-colors ${
            item.infoOnly
              ? 'cursor-default text-gray-500'
              : 'text-gray-900 hover:bg-[#ededed]'
          }`}
          aria-disabled={item.infoOnly || undefined}
        >
          <span className="min-w-0 truncate font-normal">{item.label}</span>
          {item.infoOnly ? (
            <InformationCircleIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
          ) : (
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
          )}
        </button>
      ))}
    </nav>
  );
}
