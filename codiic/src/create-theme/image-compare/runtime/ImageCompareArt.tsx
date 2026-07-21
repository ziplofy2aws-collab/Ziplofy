/** Default before/after shirt illustrations for the image compare slider. */

export function ImageCompareBeforeShirt() {
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" aria-hidden style={{ display: 'block' }}>
      <rect x="0" y="0" width="200" height="240" fill="#f4f4f4" />
      <path
        d="M48 78 L100 58 L152 78 L152 210 L48 210 Z"
        fill="#e76f51"
        stroke="#c45a3f"
        strokeWidth="2"
      />
      <path d="M48 78 Q100 98 152 78" fill="none" stroke="#d4a017" strokeWidth="5" />
      <ellipse cx="100" cy="72" rx="28" ry="10" fill="#d4a017" />
      <path d="M62 95 L138 95" stroke="#c45a3f" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export function ImageCompareAfterShirt() {
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" aria-hidden style={{ display: 'block' }}>
      <rect x="0" y="0" width="200" height="240" fill="#f4f4f4" />
      <path
        d="M48 78 L100 58 L152 78 L152 210 L48 210 Z"
        fill="#2a6b6b"
        stroke="#1f5252"
        strokeWidth="2"
      />
      <rect x="118" y="118" width="28" height="22" rx="3" fill="#1f5252" opacity="0.85" />
      <path d="M48 155 L152 155 L152 210 L48 210 Z" fill="#1f5252" opacity="0.55" />
      <path d="M48 170 L152 170" stroke="#163d3d" strokeWidth="2" opacity="0.5" />
      <path d="M48 188 L152 188" stroke="#163d3d" strokeWidth="2" opacity="0.5" />
      <ellipse cx="100" cy="72" rx="28" ry="10" fill="#1f5252" />
    </svg>
  );
}
