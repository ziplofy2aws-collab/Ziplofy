/** Placeholder illustrations for collection list bento tiles. */

export function FoldedShirtsIllustration() {
  return (
    <div style={{ position: 'relative', width: 64, height: 52, margin: '0 auto' }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '18%',
          width: 28,
          height: 38,
          transform: 'rotate(-8deg)',
          borderRadius: 4,
          background: '#5a9a6a',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '28%',
          top: '10%',
          width: 28,
          height: 40,
          transform: 'rotate(4deg)',
          borderRadius: 4,
          background: '#e8c547',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '2%',
          top: '22%',
          width: 26,
          height: 36,
          transform: 'rotate(10deg)',
          borderRadius: 4,
          background: '#d45454',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
    </div>
  );
}

export function HangerShirtsIllustration() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6 }} aria-hidden>
      {(['#6b7280', '#c44d4d', '#4a9a9a'] as const).map((color, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 2, width: 20, height: 2, borderRadius: 999, background: '#6b7280' }} />
          <div style={{ width: 24, height: 36, borderRadius: '4px 4px 2px 2px', background: color }} />
        </div>
      ))}
    </div>
  );
}

export function HangingSweatersIllustration() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8 }} aria-hidden>
      <div style={{ width: 28, height: 44, borderRadius: '8px 8px 4px 4px', background: '#9ca3af' }} />
      <div style={{ width: 28, height: 44, borderRadius: '8px 8px 4px 4px', background: '#e8c547' }} />
      <div style={{ width: 28, height: 44, borderRadius: '8px 8px 4px 4px', background: '#5ba8a8' }} />
    </div>
  );
}

export function ClothingRackIllustration({ wide = false }: { wide?: boolean }) {
  if (wide) {
    return (
      <div style={{ position: 'relative', width: 128, height: 56, margin: '0 auto' }} aria-hidden>
        <div style={{ position: 'absolute', bottom: 12, left: 4, right: 4, height: 1, background: '#6b7280' }} />
        <div style={{ position: 'absolute', bottom: 12, left: '50%', width: 1, height: 36, transform: 'translateX(-50%)', background: '#6b7280' }} />
        <div style={{ position: 'absolute', top: 8, left: 16, width: 16, height: 24, borderRadius: 4, background: '#d45454' }} />
        <div style={{ position: 'absolute', top: 8, left: '50%', width: 16, height: 24, transform: 'translateX(-50%)', borderRadius: 4, background: '#e8c547' }} />
        <div style={{ position: 'absolute', top: 8, right: 16, width: 16, height: 24, borderRadius: 4, background: '#9ca3af' }} />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: 56, height: 48, margin: '0 auto' }} aria-hidden>
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, height: 1, background: '#6b7280' }} />
      <div style={{ position: 'absolute', bottom: 8, left: '50%', width: 1, height: 32, transform: 'translateX(-50%)', background: '#6b7280' }} />
      <div style={{ position: 'absolute', top: 4, left: 6, width: 12, height: 20, borderRadius: 4, background: '#d45454' }} />
      <div style={{ position: 'absolute', top: 4, left: '50%', width: 12, height: 20, transform: 'translateX(-50%)', borderRadius: 4, background: '#e8c547' }} />
      <div style={{ position: 'absolute', top: 4, right: 6, width: 12, height: 20, borderRadius: 4, background: '#9ca3af' }} />
    </div>
  );
}

export type CollectionIllustrationVariant =
  | 'folded-shirts'
  | 'hanger-shirts'
  | 'hanging-sweaters'
  | 'clothing-rack';

export function CollectionTileIllustration({
  variant,
  wide = false,
}: {
  variant: CollectionIllustrationVariant;
  wide?: boolean;
}) {
  switch (variant) {
    case 'hanger-shirts':
      return <HangerShirtsIllustration />;
    case 'hanging-sweaters':
      return <HangingSweatersIllustration />;
    case 'clothing-rack':
      return <ClothingRackIllustration wide={wide} />;
    case 'folded-shirts':
    default:
      return <FoldedShirtsIllustration />;
  }
}
