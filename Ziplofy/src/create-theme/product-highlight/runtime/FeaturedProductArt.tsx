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
  return (
    <div style={{ position: 'relative', width: 140, height: 120, margin: '0 auto' }} aria-hidden>
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
    </div>
  );
}
