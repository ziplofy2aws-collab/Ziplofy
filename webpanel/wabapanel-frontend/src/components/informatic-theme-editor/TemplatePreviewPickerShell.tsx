'use client';

import type { ReactNode, RefObject } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export type TemplatePreviewPickerShellProps = {
  rootRef: RefObject<HTMLDivElement | null>;
  label: string;
  open: boolean;
  onToggle: () => void;
  trigger: ReactNode;
  triggerAside?: ReactNode;
  children: ReactNode;
};

export function TemplatePreviewPickerShell({
  rootRef,
  label,
  open,
  onToggle,
  trigger,
  triggerAside,
  children,
}: TemplatePreviewPickerShellProps) {
  return (
    <div
      ref={rootRef}
      className="relative border-b border-[#e8e9eb] bg-gradient-to-b from-white to-[#f8f9fa] px-3 py-3.5"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6d7175]">
          {label}
        </p>
        <span className="rounded-full bg-[#eef3ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#005bd3]">
          Live preview
        </span>
      </div>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onToggle}
        className={`group flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-left shadow-sm transition-all ${
          open
            ? 'border-[#005bd3] ring-2 ring-[#005bd3]/15'
            : 'border-[#dfe1e4] hover:border-[#b8bcc0] hover:shadow'
        }`}
      >
        <div className="min-w-0 flex-1">{trigger}</div>
        {triggerAside}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150 group-hover:text-gray-600 ${
            open ? 'rotate-180 text-[#005bd3]' : ''
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-3 right-3 z-[1600] mt-2 overflow-hidden rounded-xl border border-[#d1d4d8] bg-white shadow-[0_12px_32px_rgba(22,28,36,0.16)]"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function TemplatePreviewPickerThumb({
  src,
  size = 'lg',
}: {
  src?: string | null;
  size?: 'lg' | 'sm';
}) {
  const box = size === 'lg' ? 'h-11 w-11 rounded-lg' : 'h-8 w-8 rounded-md';
  if (src) {
    return <img src={src} alt="" className={`${box} shrink-0 bg-[#f1f2f3] object-cover`} />;
  }
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center bg-[#f1f2f3] text-[10px] font-semibold uppercase tracking-wide text-[#8c9196]`}
      aria-hidden
    >
      ···
    </span>
  );
}

export function TemplatePreviewPickerOption({
  selected,
  onClick,
  thumb,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  thumb?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
        selected ? 'bg-[#eef3ff]' : 'hover:bg-[#f6f6f7]'
      }`}
    >
      {thumb}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13px] ${
            selected ? 'font-semibold text-[#005bd3]' : 'font-medium text-gray-900'
          }`}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="block truncate text-[11px] text-gray-500">{subtitle}</span>
        ) : null}
      </span>
      {selected ? <Check className="h-4 w-4 shrink-0 text-[#005bd3]" aria-hidden /> : null}
    </button>
  );
}

export const templatePreviewSearchClassName =
  'w-full rounded-lg border border-[#c9cccf] bg-[#fafbfc] py-2 pl-8 pr-3 text-[13px] text-gray-900 outline-none transition focus:border-[#005bd3] focus:bg-white focus:ring-2 focus:ring-[#005bd3]/15';

export const templatePreviewViewLinkClassName =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#f1f2f3] hover:text-gray-700';
