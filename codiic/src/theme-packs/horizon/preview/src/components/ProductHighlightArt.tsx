/** Decorative illustrations for Product highlight (editor + storefront). */

export function StackedTealShirtsIllustration() {
  return (
    <div className="relative mx-auto h-[120px] w-[140px]" aria-hidden>
      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          style={{
            position: 'absolute',
            left: '50%',
            borderRadius: 4,
            background: '#4a9a9a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            width: `${88 - layer * 10}px`,
            height: `${28 - layer * 3}px`,
            bottom: `${layer * 22}px`,
            transform: `translateX(-50%) rotate(${-5 + layer * 5}deg) skewX(-8deg)`,
            clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
            opacity: 1 - layer * 0.1,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: '58%',
          bottom: '38px',
          width: 14,
          height: 10,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.35)',
          transform: 'rotate(-8deg)',
        }}
      />
    </div>
  );
}

export function HighlightProductShirtIllustration() {
  return (
    <div
      style={{
        position: 'relative',
        width: 160,
        height: 180,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 4,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 8,
          transform: 'translateX(-50%)',
          width: 120,
          height: 140,
          borderRadius: '8px 8px 4px 4px',
          background: '#c45c4a',
          boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            right: 8,
            top: 0,
            height: 14,
            borderRadius: '0 0 6px 6px',
            background: '#e8c547',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '32%',
            width: 6,
            height: '42%',
            background: '#e8c547',
            borderRadius: '0 4px 4px 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '32%',
            width: 6,
            height: '42%',
            background: '#e8c547',
            borderRadius: '4px 0 0 4px',
          }}
        />
      </div>
    </div>
  );
}
