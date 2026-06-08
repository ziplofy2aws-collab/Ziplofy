import type { CSSProperties } from 'react';

type Props = {
  icon: string;
  style?: CSSProperties;
};

/** Outline icons for Icons with text columns. */
export function IconGlyph({ icon, style }: Props) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
    style: { flexShrink: 0, ...style },
  };

  switch (icon) {
    case 'heart':
      return (
        <svg {...common}>
          <path
            d="M12 20.5s-7-4.5-7-9.5a4.5 4.5 0 0 1 7.5-3.3A4.5 4.5 0 0 1 19 11c0 5-7 9.5-7 9.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'person':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'leaf':
      return (
        <svg {...common}>
          <path
            d="M12 3c-4 6-4 10 0 18 4-8 4-12 0-18Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'truck':
      return (
        <svg {...common}>
          <path
            d="M3 8h11v8H3V8Zm11 2h4l2 3v3h-6v-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="17" r="1.5" fill="currentColor" />
          <circle cx="17" cy="17" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path
            d="M12 3 5 6v6c0 4.5 3.5 7.5 7 9 3.5-1.5 7-4.5 7-9V6l-7-3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'star':
      return (
        <svg {...common}>
          <path
            d="M12 4l2.2 5 5.5.5-4.2 3.5 1.3 5.5-4.8-3-4.8 3 1.3-5.5-4.2-3.5 5.5-.5L12 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'gift':
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 10V20M4 10h16M8 10c0-2 1.5-4 4-4s4 2 4 4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'eye':
    default:
      return (
        <svg {...common}>
          <path
            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
}
