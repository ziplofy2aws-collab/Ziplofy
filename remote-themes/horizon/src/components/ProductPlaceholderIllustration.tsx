type Props = {
  shirtColor: string;
  withSun?: boolean;
  striped?: boolean;
  trimColor?: string;
};

/** Flat t-shirt illustration for empty featured-collection grids (Shopify editor style). */
export function ProductPlaceholderIllustration({
  shirtColor,
  withSun = false,
  striped = false,
  trimColor = '#e8c547',
}: Props) {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: 56,
        height: 68,
        borderRadius: '10px 10px 6px 6px',
        backgroundColor: shirtColor,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 8,
          right: 8,
          height: 10,
          borderRadius: '0 0 4px 4px',
          backgroundColor: trimColor,
          opacity: 0.95,
        }}
      />
      {!striped && trimColor ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '28%',
              width: 5,
              height: '42%',
              backgroundColor: trimColor,
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '28%',
              width: 5,
              height: '42%',
              backgroundColor: trimColor,
              opacity: 0.9,
            }}
          />
        </>
      ) : null}
      {striped ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '48%',
            background: `repeating-linear-gradient(
              180deg,
              ${shirtColor} 0px,
              ${shirtColor} 5px,
              rgba(0,0,0,0.14) 5px,
              rgba(0,0,0,0.14) 9px
            )`,
          }}
        />
      ) : null}
      {withSun ? (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 14,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
            boxShadow: '0 0 0 2px rgba(251,191,36,0.35)',
          }}
        />
      ) : null}
    </div>
  );
}

export const FEATURED_COLLECTION_PLACEHOLDER_TILES = [
  { shirtColor: '#d97757', trimColor: '#e8c547' },
  { shirtColor: '#4a9a9a', striped: true, trimColor: '#3d8585' },
  { shirtColor: '#4b5563', withSun: true, trimColor: '#6b7280' },
  { shirtColor: '#d97757', trimColor: '#e8c547' },
] as const;
