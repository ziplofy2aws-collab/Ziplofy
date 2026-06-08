import type { CSSProperties } from 'react';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';

type HeroMediaBackgroundProps = {
  media1Url: string;
  media2Url: string;
  fallbackUrl?: string;
};

const tileStyle = (url: string): CSSProperties => ({
  flex: '0 0 50%',
  width: '50%',
  maxWidth: '50%',
  height: '100%',
  background: `center/cover url(${url}) no-repeat`,
});

export function HeroMediaBackground({
  media1Url,
  media2Url,
  fallbackUrl,
}: HeroMediaBackgroundProps) {
  const url1 = media1Url.trim();
  const url2 = media2Url.trim();

  if (url1 && url2) {
    return (
      <div
        aria-hidden
        className="hero-dual-media-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
        }}
      >
        <div className="hero-dual-media-tile hero-dual-media-tile--1" style={tileStyle(url1)} />
        <div className="hero-dual-media-tile hero-dual-media-tile--2" style={tileStyle(url2)} />
      </div>
    );
  }

  const single = url1 || url2 || fallbackUrl?.trim() || '';
  if (single) {
    return (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `center/cover url(${single}) no-repeat`,
        }}
      />
    );
  }

  return <HeroLandscapeBackdrop />;
}
