/** Decorative hero background when no image URL is set (Shopify-style lake/mountains scene). */
export function HeroLandscapeBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: '#3b6f74',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c98f73" />
            <stop offset="45%" stopColor="#cd9a7e" />
            <stop offset="100%" stopColor="#b7917f" />
          </linearGradient>
          <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f7d80" />
            <stop offset="100%" stopColor="#2f6064" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect width="1200" height="430" fill="url(#hero-sky)" />
        {/* hazy sun glow */}
        <ellipse cx="560" cy="150" rx="240" ry="120" fill="#d9b294" opacity="0.55" />
        {/* faint bird */}
        <path
          d="M495 70 q14 -10 28 0 q14 -10 28 0"
          fill="none"
          stroke="#7c5a48"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* far right mountain range (lighter) */}
        <path d="M760 250 L900 90 L1040 250 Z" fill="#9aa0a3" />
        <path d="M980 250 L1090 120 L1200 250 L1200 250 Z" fill="#aab0b2" />
        {/* far right snow/face highlight */}
        <path d="M900 90 L948 145 L900 175 L862 150 Z" fill="#c4c9cb" />

        {/* left rocky cliff (dark gray, large) */}
        <path d="M0 60 L120 30 L300 250 L150 320 L0 250 Z" fill="#6f767a" />
        <path d="M0 60 L120 30 L210 150 L90 200 L0 150 Z" fill="#828a8e" />
        {/* left cliff lower mass */}
        <path d="M0 250 L150 200 L320 340 L120 400 L0 360 Z" fill="#5f676b" />

        {/* central distant mountain */}
        <path d="M300 250 L470 110 L640 250 Z" fill="#7e858a" />
        <path d="M470 110 L545 175 L470 210 L410 178 Z" fill="#90979b" />

        {/* pine forest band (left) */}
        <g fill="#2f5a45">
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 20 + i * 28;
            return <path key={`pl-${i}`} d={`M${x} 300 L${x + 14} 248 L${x + 28} 300 Z`} />;
          })}
        </g>
        <g fill="#27503d">
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 14 + i * 28;
            return <path key={`pl2-${i}`} d={`M${x} 320 L${x + 16} 262 L${x + 32} 320 Z`} />;
          })}
        </g>

        {/* pine forest band (right) */}
        <g fill="#2f5a45">
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 800 + i * 30;
            return <path key={`pr-${i}`} d={`M${x} 300 L${x + 15} 244 L${x + 30} 300 Z`} />;
          })}
        </g>
        <g fill="#27503d">
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 808 + i * 30;
            return <path key={`pr2-${i}`} d={`M${x} 322 L${x + 16} 260 L${x + 32} 322 Z`} />;
          })}
        </g>

        {/* dark shoreline / treeline across the middle */}
        <path
          d="M0 320 L260 300 L520 322 L780 302 L1040 320 L1200 305 L1200 360 L0 360 Z"
          fill="#244a3a"
        />

        {/* lake */}
        <rect y="356" width="1200" height="244" fill="url(#hero-water)" />
        {/* water ripples / reflections */}
        <g stroke="#5a979a" strokeWidth="3" strokeLinecap="round" opacity="0.5">
          <line x1="120" y1="400" x2="300" y2="400" />
          <line x1="420" y1="430" x2="640" y2="430" />
          <line x1="760" y1="408" x2="940" y2="408" />
          <line x1="200" y1="470" x2="380" y2="470" />
          <line x1="560" y1="500" x2="760" y2="500" />
        </g>

        {/* ---- two figures, viewed from behind, lower-right ---- */}
        {/* woman (green top, brown hair with ponytail) */}
        <g>
          {/* sweater back */}
          <path d="M734 600 Q734 404 846 404 Q958 404 958 600 Z" fill="#3f7d52" />
          <path d="M846 404 Q904 410 928 478 L908 600 L846 600 Z" fill="#357045" opacity="0.55" />
          {/* neck */}
          <rect x="826" y="348" width="40" height="42" rx="14" fill="#c79a78" />
          {/* head */}
          <ellipse cx="846" cy="310" rx="56" ry="64" fill="#3b2a23" />
          {/* ponytail draping over the shoulder */}
          <path
            d="M862 328 Q908 358 904 442 Q900 524 866 572 Q844 548 856 472 Q866 396 836 348 Z"
            fill="#492f25"
          />
        </g>

        {/* man (red top, dark hair) at the far-right edge */}
        <g>
          {/* sweater back, extends past the right edge */}
          <path d="M936 600 Q936 402 1060 402 Q1200 402 1208 600 Z" fill="#b5503f" />
          {/* collar hint */}
          <path
            d="M1016 416 Q1060 446 1104 416"
            fill="none"
            stroke="#d8a98c"
            strokeWidth="7"
            opacity="0.7"
          />
          {/* neck */}
          <rect x="1036" y="346" width="46" height="42" rx="14" fill="#92684a" />
          {/* head */}
          <ellipse cx="1060" cy="306" rx="62" ry="70" fill="#1d1916" />
          {/* cheek/jaw turning into view on the left of the head */}
          <ellipse cx="1018" cy="338" rx="15" ry="24" fill="#92684a" />
        </g>
      </svg>
    </div>
  );
}
