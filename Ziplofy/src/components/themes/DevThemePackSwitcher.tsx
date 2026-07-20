import React from 'react';
import {
  DEV_STATIC_THEME_PACKS,
  type DevStaticThemePackId,
} from '../../config/theme-editor-static.config';

type DevThemePackSwitcherProps = {
  value: DevStaticThemePackId;
  onChange: (packId: DevStaticThemePackId) => void;
  disabled?: boolean;
};

/** Switch bundled static dev packs without restarting the admin app. */
export function DevThemePackSwitcher({ value, onChange, disabled }: DevThemePackSwitcherProps) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-gray-200 p-0.5"
      role="group"
      aria-label="Dev theme pack"
    >
      {DEV_STATIC_THEME_PACKS.map((pack) => {
        const active = value === pack.id;
        return (
          <button
            key={pack.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(pack.id)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors sm:px-2.5 sm:text-xs ${
              active
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } disabled:opacity-50`}
            aria-pressed={active}
          >
            {pack.label}
          </button>
        );
      })}
    </div>
  );
}
