/** Placeholder folded-tee art for the Recommended products card grid. */
export function RecommendedProductCardArt({
  shirtColor,
  withSun = false,
}: {
  shirtColor: string;
  withSun?: boolean;
}) {
  const accent = withSun ? '#3f4753' : '#e8b84b';
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 8,
        background: '#f1f1f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 120"
        width="62%"
        height="62%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* sleeves / shoulders (accent trim behind body) */}
        <path
          d="M30 30 L46 18 Q60 30 74 18 L90 30 L104 46 L90 58 L86 50 L86 60 L34 60 L34 50 L30 58 L16 46 Z"
          fill={accent}
        />
        {/* shirt body */}
        <path
          d="M34 42 L86 42 L86 102 Q86 104 84 104 L36 104 Q34 104 34 102 Z"
          fill={shirtColor}
        />
        {/* sleeve caps */}
        <path d="M30 30 L46 18 Q52 24 50 44 L34 50 L34 42 L30 38 Z" fill={shirtColor} />
        <path d="M90 30 L74 18 Q68 24 70 44 L86 50 L86 42 L90 38 Z" fill={shirtColor} />
        {/* collar */}
        <path d="M46 18 Q60 34 74 18 L70 16 Q60 26 50 16 Z" fill={accent} />
        {/* subtle shoulder shadow */}
        <path d="M34 42 L86 42 L86 48 L34 48 Z" fill="rgba(0,0,0,0.06)" />

        {withSun ? (
          <g>
            <circle cx="60" cy="74" r="13" fill="#e0664f" />
            <rect x="48" y="80" width="24" height="2.6" rx="1.3" fill="#f1f1f1" />
            <rect x="48" y="85" width="24" height="2.6" rx="1.3" fill="#f1f1f1" />
            <rect x="48" y="90" width="24" height="2.6" rx="1.3" fill="#f1f1f1" />
          </g>
        ) : (
          <>
            {/* chest pocket */}
            <rect x="46" y="60" width="16" height="14" rx="2" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  );
}
