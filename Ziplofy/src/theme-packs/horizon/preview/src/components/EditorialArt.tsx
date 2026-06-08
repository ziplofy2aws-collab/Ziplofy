/** Decorative illustration for Editorial section media column. */

export function TealFoldedShirtIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        width: 88,
        height: 96,
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: 72,
          height: 64,
          transform: 'translateX(-50%) skewX(-10deg)',
          borderRadius: 4,
          background: '#4a9a9a',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '62%',
          bottom: 28,
          width: 16,
          height: 12,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.35)',
          transform: 'rotate(-12deg)',
        }}
      />
    </div>
  );
}
