/** Decorative hero background when no image URL is set (Shopify-style landscape). */
export function HeroLandscapeBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, #e8b89a 0%, #c9a07a 18%, #8fb8a8 42%, #4a8f9c 68%, #2d6478 100%)',
      }}
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <rect width="1200" height="600" fill="#e8b89a" />
        <ellipse cx="600" cy="120" rx="280" ry="80" fill="#f5d4b8" opacity="0.9" />
        <circle cx="180" cy="90" r="36" fill="#fff8f0" opacity="0.85" />
        <path
          d="M0 380 L120 320 L240 360 L400 280 L560 340 L720 260 L880 300 L1040 240 L1200 280 L1200 600 L0 600 Z"
          fill="#3d6b5a"
        />
        <path
          d="M0 400 L200 360 L380 390 L520 330 L680 370 L860 310 L1000 350 L1200 320 L1200 600 L0 600 Z"
          fill="#2d8a7a"
        />
        <path d="M0 420 Q600 380 1200 420 L1200 600 L0 600 Z" fill="#3a9e8c" />
        <ellipse cx="420" cy="430" rx="200" ry="28" fill="#1f5f6e" opacity="0.35" />
        {/* Foreground silhouettes (Shopify bottom-aligned hero) */}
        <ellipse cx="340" cy="518" rx="88" ry="52" fill="#3d2f28" opacity="0.92" />
        <ellipse cx="395" cy="505" rx="36" ry="34" fill="#4a382f" opacity="0.95" />
        <ellipse cx="520" cy="522" rx="78" ry="48" fill="#352820" opacity="0.9" />
        <ellipse cx="565" cy="508" rx="32" ry="30" fill="#45352c" opacity="0.95" />
        <path d="M310 560 Q360 520 420 540 Q480 520 530 555" fill="none" stroke="#2d6478" strokeWidth="2" opacity="0.25" />
      </svg>
    </div>
  );
}
