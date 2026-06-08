import React from 'react';

/** Matches live Horizon header icon row (thin stroke, dark gray). */
const ICON = 'h-5 w-5 shrink-0 text-[#1a1a1a]';

function HeaderUtilityIcons() {
  return (
    <div className="flex shrink-0 items-center gap-5" aria-hidden>
      <svg className={ICON} viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <svg className={ICON} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <svg className={ICON} viewBox="0 0 24 24" fill="none">
        <path
          d="M8 8V6a4 4 0 118 0v2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M6 8h12l-1 12H7L6 8z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Add-section + catalog preview — same chrome as the live header:
 * white bar, logo + nav left, utility icons right, subtle bottom border.
 */
function HeaderPreviewArt() {
  return (
    <div className="w-full max-w-4xl">
      <header
        className="flex w-full items-center justify-between gap-6 border-b border-[#e5e7eb] bg-white px-6 py-4"
        aria-label="Header preview"
      >
        <div className="flex min-w-0 items-center gap-10">
          <span className="shrink-0 text-lg font-bold leading-none tracking-tight text-[#111827]">
            My Store
          </span>
          <nav className="flex items-center gap-6">
            <span className="text-sm font-normal text-[#4b5563]">Home</span>
            <span className="text-sm font-normal text-[#4b5563]">Catalog</span>
            <span className="text-sm font-normal text-[#4b5563]">Contact</span>
          </nav>
        </div>
        <HeaderUtilityIcons />
      </header>
    </div>
  );
}

export function HeaderPreview() {
  return <HeaderPreviewArt />;
}

export { HeaderPreviewArt };
