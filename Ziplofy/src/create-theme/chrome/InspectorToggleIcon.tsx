import React from 'react';

/** Cursor-in-dashed-box icon (Shopify-style theme inspector). */
export function InspectorToggleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3.5 4.75A1.25 1.25 0 0 1 4.75 3.5h10.5a1.25 1.25 0 0 1 1.25 1.25v10.5a1.25 1.25 0 0 1-1.25 1.25H4.75a1.25 1.25 0 0 1-1.25-1.25V4.75Zm1.25-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.75a.25.25 0 0 0-.25-.25H4.75Z"
        clipRule="evenodd"
        opacity={0.45}
      />
      <path d="M11.78 9.78a.75.75 0 0 0-1.06-1.06L5.47 14.47l-1.28-.28a.75.75 0 0 0-.8.8l.28 1.28 5.25-5.25 2.86 2.86 1.28-.28a.75.75 0 0 0-.8-.8l-.28-1.28-2.86-2.86Z" />
    </svg>
  );
}
