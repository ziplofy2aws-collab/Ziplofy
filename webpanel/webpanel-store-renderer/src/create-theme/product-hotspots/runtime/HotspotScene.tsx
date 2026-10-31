/** Decorative sunset-lake scene used when no hotspot image is set. */
export function HotspotScene() {
  return (
    <svg
      viewBox="0 0 960 420"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3a181" />
          <stop offset="0.55" stopColor="#f0b59c" />
          <stop offset="1" stopColor="#f4c9b5" />
        </linearGradient>
        <linearGradient id="zph-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aa6a2" />
          <stop offset="1" stopColor="#3a8d8a" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="960" height="300" fill="url(#zph-sky)" />

      {/* sun */}
      <circle cx="430" cy="96" r="30" fill="#ffffff" />

      {/* birds */}
      <path d="M330 96 q10 -8 20 0 q10 -8 20 0" fill="none" stroke="#c9694f" strokeWidth="3" strokeLinecap="round" />
      <path d="M540 110 q10 -8 20 0 q10 -8 20 0" fill="none" stroke="#c9694f" strokeWidth="3" strokeLinecap="round" />
      <path d="M520 150 q9 -7 18 0 q9 -7 18 0" fill="none" stroke="#c9694f" strokeWidth="3" strokeLinecap="round" />

      {/* soft cloud bands */}
      <ellipse cx="690" cy="150" rx="180" ry="26" fill="#f6d6c6" opacity="0.7" />
      <ellipse cx="250" cy="190" rx="150" ry="22" fill="#f1c0aa" opacity="0.6" />

      {/* far mountains */}
      <path d="M0 250 L120 120 L240 250 Z" fill="#8a93a0" />
      <path d="M180 250 L300 150 L420 250 Z" fill="#9aa2ad" />
      <path d="M620 250 L760 140 L900 250 Z" fill="#8a93a0" />
      <path d="M820 250 L960 160 L960 250 Z" fill="#9aa2ad" />

      {/* pine tree rows */}
      {[60, 110, 160, 210, 360, 410, 720, 770, 820, 880].map((x, i) => (
        <path
          key={`${x}-${i}`}
          d={`M${x} 286 L${x - 20} 286 L${x} 236 L${x + 20} 286 Z`}
          fill={i % 2 === 0 ? '#1f6f5c' : '#175a4a'}
        />
      ))}

      {/* lake */}
      <rect x="0" y="288" width="960" height="132" fill="url(#zph-water)" />
      <rect x="0" y="300" width="960" height="6" fill="#5cb3ae" opacity="0.5" />
      <rect x="0" y="330" width="960" height="5" fill="#5cb3ae" opacity="0.4" />

      {/* canoe with two figures */}
      <g transform="translate(300 300)">
        {/* woman (green) */}
        <path d="M330 96 q12 -64 40 -64 q28 0 40 64 Z" fill="#1f6f5c" />
        <circle cx="370" cy="22" r="16" fill="#caa07f" />
        <path d="M384 18 q16 6 14 40 q-8 26 -22 26 q14 -34 8 -66 Z" fill="#7a3b3b" />
        {/* man (coral) */}
        <path d="M430 96 q12 -60 40 -60 q28 0 40 60 Z" fill="#d96a52" />
        <circle cx="470" cy="26" r="16" fill="#9c6b4a" />
        <path d="M456 16 q14 -14 28 0 q4 8 0 14 q-14 -10 -28 0 Z" fill="#15233a" />
        <path d="M430 96 h40 v6 h-40 Z" fill="#ffffff" opacity="0.8" />
        {/* canoe hull */}
        <path d="M250 96 Q420 150 600 96 L580 116 Q420 156 270 116 Z" fill="#16313a" />
        <path d="M300 92 h180 v8 h-180 Z" fill="#8a5a36" opacity="0.7" />
      </g>
    </svg>
  );
}
