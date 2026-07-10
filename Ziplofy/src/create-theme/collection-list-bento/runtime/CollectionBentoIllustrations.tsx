/** Placeholder illustrations for collection list tiles. */

export function FoldedShirtsIllustration() {
  return (
    <div style={{ position: 'relative', width: 168, height: 140, margin: '0 auto' }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '18%',
          width: 74,
          height: 100,
          transform: 'rotate(-8deg)',
          borderRadius: 10,
          background: '#5a9a6a',
          boxShadow: '0 6px 16px rgba(0,0,0,0.14)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '28%',
          top: '8%',
          width: 74,
          height: 106,
          transform: 'rotate(4deg)',
          borderRadius: 10,
          background: '#e8c547',
          boxShadow: '0 6px 16px rgba(0,0,0,0.14)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '2%',
          top: '22%',
          width: 68,
          height: 96,
          transform: 'rotate(10deg)',
          borderRadius: 10,
          background: '#d45454',
          boxShadow: '0 6px 16px rgba(0,0,0,0.14)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
        }}
      />
    </div>
  );
}

export function HangerShirtsIllustration() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14 }}
      aria-hidden
    >
      {(['#6b7280', '#c44d4d', '#4a9a9a'] as const).map((color, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{ marginBottom: 5, width: 52, height: 5, borderRadius: 999, background: '#6b7280' }}
          />
          <div
            style={{ width: 62, height: 92, borderRadius: '10px 10px 6px 6px', background: color }}
          />
        </div>
      ))}
    </div>
  );
}

export function HangingSweatersIllustration() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 18 }}
      aria-hidden
    >
      <div style={{ width: 70, height: 112, borderRadius: '18px 18px 8px 8px', background: '#9ca3af' }} />
      <div style={{ width: 70, height: 112, borderRadius: '18px 18px 8px 8px', background: '#e8c547' }} />
      <div style={{ width: 70, height: 112, borderRadius: '18px 18px 8px 8px', background: '#5ba8a8' }} />
    </div>
  );
}

export function ClothingRackIllustration({ wide = false }: { wide?: boolean }) {
  if (wide) {
    return (
      <div style={{ position: 'relative', width: 260, height: 140, margin: '0 auto' }} aria-hidden>
        <div style={{ position: 'absolute', bottom: 28, left: 8, right: 8, height: 3, background: '#6b7280' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            width: 3,
            height: 86,
            transform: 'translateX(-50%)',
            background: '#6b7280',
          }}
        />
        <div style={{ position: 'absolute', top: 18, left: 36, width: 40, height: 62, borderRadius: 8, background: '#d45454' }} />
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            width: 40,
            height: 62,
            transform: 'translateX(-50%)',
            borderRadius: 8,
            background: '#e8c547',
          }}
        />
        <div style={{ position: 'absolute', top: 18, right: 36, width: 40, height: 62, borderRadius: 8, background: '#9ca3af' }} />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: 150, height: 128, margin: '0 auto' }} aria-hidden>
      <div style={{ position: 'absolute', bottom: 22, left: 6, right: 6, height: 3, background: '#6b7280' }} />
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          width: 3,
          height: 82,
          transform: 'translateX(-50%)',
          background: '#6b7280',
        }}
      />
      <div style={{ position: 'absolute', top: 12, left: 18, width: 34, height: 54, borderRadius: 8, background: '#d45454' }} />
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          width: 34,
          height: 54,
          transform: 'translateX(-50%)',
          borderRadius: 8,
          background: '#e8c547',
        }}
      />
      <div style={{ position: 'absolute', top: 12, right: 18, width: 34, height: 54, borderRadius: 8, background: '#9ca3af' }} />
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
