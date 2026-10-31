import React from 'react';

type Props = {
  className?: string;
  title?: string;
};

/** Codiix face mark — header entry point (Shopify Sidekick–style placement). */
export function CodiixFaceIcon({ className = 'h-7 w-7', title }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="20" cy="20" r="20" fill="#111111" />
      <ellipse cx="20" cy="22.5" rx="11.5" ry="10" fill="#f8faf9" />
      <path
        d="M11.5 18.5c1.2-4.2 4-6.5 8.5-6.5s7.3 2.3 8.5 6.5"
        stroke="#111111"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="15.2" cy="21.2" r="2.15" fill="#0b1220" />
      <circle cx="24.8" cy="21.2" r="2.15" fill="#0b1220" />
      <circle cx="15.7" cy="20.7" r="0.55" fill="#fff" />
      <circle cx="25.3" cy="20.7" r="0.55" fill="#fff" />
      <path
        d="M17.2 26.2c1.1.9 2.3 1.35 2.8 1.35s1.7-.45 2.8-1.35"
        stroke="#0b1220"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
