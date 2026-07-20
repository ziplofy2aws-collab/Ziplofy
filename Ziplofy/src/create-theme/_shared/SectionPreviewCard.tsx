import React from 'react';
import { FooterSectionPreviewArt } from './FooterSectionPreviewArt';
import { HeroDefaultPreviewArt } from './HeroSectionPreviewArt';
import { PreviewShell } from './PreviewShell';

type Props = {
  label: string;
  variant?: string;
};

/** Create-theme section thumbnail (variant-specific art can replace this per element). */
export function SectionPreviewCard({ label, variant = 'text-block' }: Props) {
  if (variant === 'announcement-bar') {
    return (
      <PreviewShell className="bg-gray-900 py-3 text-center">
        <p className="text-[0.55rem] font-medium text-white">Announcement</p>
      </PreviewShell>
    );
  }
  if (variant === 'header') {
    return (
      <PreviewShell className="border-b border-[#e5e7eb] bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[0.55rem] font-bold text-[#111827]">My Store</span>
            <span className="text-[0.45rem] font-normal text-[#4b5563]">Home Catalog Contact</span>
          </div>
          <span className="text-[0.5rem] text-[#1a1a1a]" aria-hidden>
            ⌕ ○ ▢
          </span>
        </div>
      </PreviewShell>
    );
  }
  if (variant === 'divider') {
    return (
      <div className="mx-auto flex h-[140px] w-full max-w-[420px] items-center justify-center bg-[#e8e8e8]">
        <div className="h-2 w-[90%] bg-white" role="presentation" />
      </div>
    );
  }
  if (variant === 'footer-section') {
    return (
      <PreviewShell className="bg-[#f1f1f1] p-2">
        <FooterSectionPreviewArt size="compact" />
      </PreviewShell>
    );
  }
  if (variant === 'hero') {
    return (
      <PreviewShell className="bg-[#f1f1f1] p-2">
        <HeroDefaultPreviewArt size="compact" />
      </PreviewShell>
    );
  }
  if (variant === 'policies-links') {
    return (
      <PreviewShell className="flex items-center justify-between gap-4 bg-[#f6f6f7]">
        <span className="text-[0.5rem] text-gray-600">© Store</span>
        <span className="text-[0.5rem] text-gray-700">Policies</span>
      </PreviewShell>
    );
  }
  return (
    <PreviewShell className="flex min-h-[72px] flex-col justify-center bg-white">
      <p className="text-[0.7rem] font-semibold text-gray-900">{label}</p>
      {variant !== 'text-block' ? (
        <p className="mt-1 text-[0.5rem] text-gray-500">{variant}</p>
      ) : null}
    </PreviewShell>
  );
}
