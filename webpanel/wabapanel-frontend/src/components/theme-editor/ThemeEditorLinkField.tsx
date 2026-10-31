import { useState } from 'react';
import { CircleStackIcon, LinkIcon } from '@heroicons/react/24/outline';
import { ThemeEditorLinkPickerDropdown } from './ThemeEditorLinkPicker';

export type ThemeEditorLinkFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  /** Show database icon for dynamic sources (Shopify-style). */
  showDynamicSource?: boolean;
  /** Show external-link icon beside label. */
  showOpenLink?: boolean;
};

export function ThemeEditorLinkField({
  id,
  label,
  value,
  placeholder = 'Paste a link or search',
  onChange,
  showDynamicSource = true,
  showOpenLink = false,
}: ThemeEditorLinkFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-800">
          {label}
        </label>
        <div className="flex items-center gap-0.5">
          {showOpenLink ? (
            <button
              type="button"
              title="Open link"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => {
                if (value.trim()) window.open(value, '_blank', 'noopener,noreferrer');
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          ) : null}
          {showDynamicSource ? (
            <button
              type="button"
              title="Connect dynamic source"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <CircleStackIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setPickerOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#c9cccf] bg-white py-2 pl-3 pr-9 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
        />
        <LinkIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <ThemeEditorLinkPickerDropdown
          open={pickerOpen}
          searchQuery={value}
          onClose={() => setPickerOpen(false)}
          onSelect={({ link }) => onChange(link)}
        />
      </div>
    </div>
  );
}
