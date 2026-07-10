import { LinkIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import { ThemeEditorLinkPickerDropdown } from '../../components/theme-editor/ThemeEditorLinkPicker';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';
import {
  THEME_CART_EMPTY_LINK_LABEL_PATH,
  resolveCartEmptyLinkLabel,
} from './theme-cart.settings';

type Props = {
  path: string;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

export function ThemeCartEmptyLinkField({ path, values, onFieldChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const raw = typeof values[path] === 'string' ? String(values[path]) : '';
  const storedLabel = values[THEME_CART_EMPTY_LINK_LABEL_PATH];
  const displayLabel = resolveCartEmptyLinkLabel(raw, storedLabel);
  const hasValue = Boolean(raw.trim());

  const openPicker = () => {
    setSearchQuery('');
    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closePicker = () => {
    setOpen(false);
    setSearchQuery('');
  };

  const clearLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFieldChange(path, 'text', '');
    onFieldChange(THEME_CART_EMPTY_LINK_LABEL_PATH, 'text', '');
    closePicker();
  };

  return (
    <div className="py-1.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[13px] text-gray-800">Empty cart button link</span>
        <button
          type="button"
          title="Open link"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          onClick={() => {
            if (raw.trim()) window.open(raw, '_blank', 'noopener,noreferrer');
          }}
        >
          <LinkIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div ref={containerRef} className="relative">
        <ThemeEditorLinkPickerDropdown
          open={open}
          searchQuery={searchQuery}
          placement="above"
          boundaryRef={containerRef}
          onClose={closePicker}
          onSelect={({ link, label }) => {
            onFieldChange(path, 'text', link);
            onFieldChange(
              THEME_CART_EMPTY_LINK_LABEL_PATH,
              'text',
              label ?? resolveCartEmptyLinkLabel(link)
            );
            closePicker();
          }}
        />

        <div
          className={`flex items-center rounded-lg border bg-white shadow-sm transition-colors ${
            open
              ? 'border-[#005bd3] ring-1 ring-[#005bd3]'
              : 'border-[#c9cccf] hover:border-[#aeb4b9]'
          }`}
        >
          <TagIcon className="ml-2.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden />

          {open ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closePicker();
              }}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 pl-2 pr-2 text-[13px] text-gray-900 focus:outline-none"
              aria-label="Search links"
            />
          ) : (
            <button
              type="button"
              onClick={openPicker}
              className="min-w-0 flex-1 truncate py-2 pl-2 pr-1 text-left text-[13px] text-gray-900"
              aria-haspopup="listbox"
            >
              <span className={hasValue ? 'text-gray-900' : 'text-gray-500'}>
                {hasValue ? displayLabel : 'Select link'}
              </span>
            </button>
          )}

          {hasValue && !open ? (
            <button
              type="button"
              onClick={clearLink}
              className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Clear link"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
