/** Placeholder product card art for Recommended products section. */

export function RecommendedProductCardArt({
  shirtColor,
  withSun = false,
}: {
  shirtColor: string;
  withSun?: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '72%',
        maxWidth: 120,
        aspectRatio: '1',
        margin: '0 auto',
        borderRadius: 8,
        background: '#f4f4f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'relative',
          width: '58%',
          height: '68%',
          borderRadius: '8px 8px 4px 4px',
          background: shirtColor,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '14%',
            background: 'rgba(0,0,0,0.1)',
          }}
        />
        {withSun ? (
          <div
            style={{
              position: 'absolute',
              right: '8%',
              top: '12%',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#fbbf24',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
