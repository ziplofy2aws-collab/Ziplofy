import type { CSSProperties } from 'react';

const shirtWrap: CSSProperties = {
  position: 'relative',
  width: 120,
  height: 140,
  margin: '0 auto',
};

const shirtBody: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  top: 24,
  borderRadius: '16px 16px 4px 4px',
  background: '#d45454',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const shirtCollar: CSSProperties = {
  position: 'absolute',
  left: 12,
  right: 12,
  top: 0,
  height: 16,
  borderRadius: '0 0 6px 6px',
  background: '#e8c547',
};

const shirtSleeve = (side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  [side]: 0,
  top: '30%',
  width: 6,
  height: '44%',
  background: 'rgba(232, 197, 71, 0.9)',
  borderRadius: side === 'left' ? '0 4px 4px 0' : '4px 0 0 4px',
});

/** Decorative shirt for Featured product (editor + storefront). */
export function FeaturedProductShirtIllustration() {
  return (
    <div style={shirtWrap} aria-hidden>
      <div style={shirtBody}>
        <div style={shirtCollar} />
        <div style={shirtSleeve('left')} />
        <div style={shirtSleeve('right')} />
      </div>
    </div>
  );
}

export function StackedTealShirtsIllustration() {
  const layers = [
    { y: 196, top: '#3f8f8b', depth: '#2b716e' },
    { y: 162, top: '#4ea09b', depth: '#347c78' },
  ];

  return (
    <svg
      viewBox="0 0 360 340"
      width="100%"
      style={{ maxWidth: 360, height: 'auto', display: 'block', margin: '0 auto' }}
      role="img"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zfp-teal-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#62b3af" />
          <stop offset="1" stopColor="#4b9b97" />
        </linearGradient>
      </defs>

      {/* soft cast shadow toward bottom-left */}
      <ellipse cx="150" cy="288" rx="148" ry="30" fill="rgba(15, 60, 60, 0.10)" />

      {/* lower stacked shirts (give the pile depth) */}
      {layers.map((layer) => (
        <g key={layer.y} transform={`translate(180 ${layer.y}) rotate(-10)`}>
          <rect x="-108" y="-38" width="216" height="124" rx="22" fill={layer.depth} />
          <rect x="-108" y="-56" width="216" height="124" rx="22" fill={layer.top} />
        </g>
      ))}

      {/* top folded shirt with collar, tag and pocket */}
      <g transform="translate(180 128) rotate(-10)">
        <rect x="-108" y="-38" width="216" height="124" rx="22" fill="#3c8783" />
        <rect x="-108" y="-56" width="216" height="124" rx="22" fill="url(#zfp-teal-top)" />

        {/* folded sleeve shoulders */}
        <path d="M-108 -34 L-70 -56 L-70 -10 Z" fill="#56aaa5" />
        <path d="M108 -34 L70 -56 L70 -10 Z" fill="#56aaa5" />

        {/* neckline crescent */}
        <ellipse cx="-2" cy="-30" rx="38" ry="18" fill="#2e7a78" />
        <ellipse cx="-2" cy="-38" rx="38" ry="18" fill="url(#zfp-teal-top)" />

        {/* white collar tag */}
        <rect x="-12" y="-58" width="22" height="16" rx="3" fill="#ffffff" />

        {/* chest pocket */}
        <rect
          x="26"
          y="-4"
          width="40"
          height="34"
          rx="6"
          fill="#4ea09b"
          stroke="#2e7a78"
          strokeWidth="3"
        />

        {/* subtle fold seam */}
        <path d="M-96 40 H96" stroke="#2e7a78" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      </g>
    </svg>
  );
}
