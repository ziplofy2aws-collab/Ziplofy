import React from 'react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { CreateThemeElement } from '../types';

export type SectionCatalogIcon =
  | 'marquee'
  | 'code'
  | 'divider'
  | 'section'
  | 'hero'
  | 'slideshow'
  | 'collection'
  | 'link'
  | 'form'
  | 'blocks'
  | 'blog'
  | 'highlight'
  | 'text';

export type SectionCatalogEntry =
  | { type: 'standalone'; element: CreateThemeElement }
  | { type: 'category'; id: string; label: string; elements: CreateThemeElement[] };

function SectionCatalogIconView({ icon }: { icon: SectionCatalogIcon }) {
  const cls = 'h-[18px] w-[18px] shrink-0 text-gray-600';
  switch (icon) {
    case 'marquee':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3 10h14M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'code':
      return (
        <span className={`flex ${cls} items-center justify-center text-[11px] font-semibold`}>&lt;/&gt;</span>
      );
    case 'divider':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'hero':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 8.5h8M6 11.5h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'slideshow':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="9" rx="1" fill="#e5e7eb" stroke="currentColor" strokeWidth="1" />
          <path d="M5 8h4v3H5V8zm6 0h4v3h-4V8z" fill="#9ca3af" />
          <circle cx="6" cy="15" r="1" fill="currentColor" />
          <circle cx="10" cy="15" r="1" fill="currentColor" />
          <circle cx="14" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case 'collection':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="3" y="12" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="12" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
    case 'link':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7.5 12.5a3 3 0 0 0 4.24 0l2.06-2.06a3 3 0 0 0-4.24-4.24L8.5 7.5M12.5 7.5a3 3 0 0 0-4.24 0L6.2 9.56a3 3 0 0 0 4.24 4.24l.82-.82"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'form':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'blocks':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 7.5h8M6 10h8M6 12.5h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'blog':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M8 12.5l1.2-1.2 2.3 2.3L14 9.5M8 8.5h4"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'highlight':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 6h10" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" strokeLinecap="round" />
          <rect x="6" y="8.5" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5 14h10" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" strokeLinecap="round" />
        </svg>
      );
    case 'text':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 9h8M6 12h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
        </svg>
      );
  }
}

export function SectionRow({
  element,
  icon = 'section',
  indented,
  isActive,
  onHover,
  onSelect,
}: {
  element: CreateThemeElement;
  icon?: SectionCatalogIcon;
  indented?: boolean;
  isActive?: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-gray-800 ${
        isActive ? 'bg-[#ededed]' : 'hover:bg-[#ededed]'
      } ${indented ? 'pl-8 pr-2' : 'px-3 pr-2'}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
    >
      <SectionCatalogIconView icon={icon} />
      <span className="min-w-0 flex-1 truncate">{element.label}</span>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#005bd3] text-white shadow-sm transition-all duration-200 ease-out ${
          isActive
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-[0.82] opacity-0'
        }`}
        aria-hidden={!isActive}
      >
        <PlusIcon
          className={`h-4 w-4 stroke-[2.5] transition-transform duration-200 ease-out ${
            isActive ? 'scale-100' : 'scale-75'
          }`}
        />
      </span>
    </button>
  );
}

export function CategoryBlock({
  entry,
  isOpen,
  hoveredId,
  onToggle,
  onHover,
  onSelect,
  iconForElement,
}: {
  entry: Extract<SectionCatalogEntry, { type: 'category' }>;
  isOpen: boolean;
  hoveredId?: string;
  onToggle: () => void;
  onHover: (element: CreateThemeElement) => void;
  onSelect: (element: CreateThemeElement) => void;
  iconForElement?: (element: CreateThemeElement) => SectionCatalogIcon;
}) {
  if (!entry.elements.length) return null;
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-[#ededed]/80"
      >
        {entry.label}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          {entry.elements.map((element) => (
            <SectionRow
              key={element.id}
              element={element}
              icon={iconForElement?.(element) ?? 'section'}
              indented
              isActive={hoveredId === element.id}
              onHover={() => onHover(element)}
              onSelect={() => onSelect(element)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
