import React from 'react';

/** Dashed selection box + cursor — theme inspector toggle. */
export function InspectorToggleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2.25"
        y="2.25"
        width="11.5"
        height="11.5"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeDasharray="2.4 1.9"
        strokeLinecap="round"
      />
      <path
        d="M11.15 10.9 11.15 17.55 13.35 15.55 14.95 18.75 16.35 18.05 14.75 14.85 17.35 14.85Z"
        fill="currentColor"
      />
    </svg>
  );
}
