import type { CSSProperties } from 'react';

const REFLECTION_HEIGHT = 148;

type HeroBlurredReflectionProps = {
  media1Url: string;
  media2Url: string;
  reflectionOpacity: number;
  overlayBackground?: string;
};

function mediaTileStyle(url: string, width?: string): CSSProperties {
  return {
    flex: width ? `0 0 ${width}` : '1 1 auto',
    width,
    height: '100%',
    background: `center/cover url(${url}) no-repeat`,
    filter: 'blur(22px)',
    transform: 'scale(1.12)',
  };
}

/**
 * Mirrored, blurred strip below the hero (Shopify Horizon-style).
 * Extends past the section bottom into the next block.
 */
export function HeroBlurredReflection({
  media1Url,
  media2Url,
  reflectionOpacity,
  overlayBackground,
}: HeroBlurredReflectionProps) {
  const url1 = media1Url.trim();
  const url2 = media2Url.trim();
  const dual = Boolean(url1 && url2);
  const single = url1 || url2;
  if (!single) return null;

  const opacity = Math.min(100, Math.max(0, reflectionOpacity)) / 100;

  return (
    <div
      aria-hidden
      className="hero-blurred-reflection"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '100%',
        height: REFLECTION_HEIGHT,
        marginTop: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 4,
        opacity,
        WebkitMaskImage:
          'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 'min(100vh, 920px)',
          display: 'flex',
          flexDirection: 'row',
          transform: 'scaleY(-1)',
          transformOrigin: 'center bottom',
        }}
      >
        {dual ? (
          <>
            <div style={mediaTileStyle(url1, '50%')} />
            <div style={mediaTileStyle(url2, '50%')} />
          </>
        ) : (
          <div style={mediaTileStyle(single)} />
        )}
      </div>
      {overlayBackground ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayBackground,
          }}
        />
      ) : null}
    </div>
  );
}
