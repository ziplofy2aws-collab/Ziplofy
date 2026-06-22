import type { CSSProperties } from 'react';
import type { LayeredSlideshowSlide } from './layeredSlideshowStyles';

type Props = {
  variant: LayeredSlideshowSlide['peekVariant'];
  imageUrl?: string;
  style?: CSSProperties;
};

/** Stylized figure illustration (default slide art). */
export function LayeredSlideshowFigureArt({ imageUrl, style }: Omit<Props, 'variant'>) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{
          ...style,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '4%',
          width: '36%',
          height: '20%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: '#e8c4a8',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '17%',
          width: '50%',
          height: '22%',
          transform: 'translateX(-50%)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          background: '#fff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '23%',
          width: '94%',
          height: '77%',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
          borderTopLeftRadius: '28%',
          borderTopRightRadius: '28%',
          background: '#4a7fc4',
        }}
      >
        <div style={{ position: 'absolute', left: '9%', top: 0, width: '13%', height: '100%', background: '#3a6dad' }} />
        <div style={{ position: 'absolute', right: '9%', top: 0, width: '13%', height: '100%', background: '#3a6dad' }} />
      </div>
    </div>
  );
}

/** Peek strip landscape illustration. */
export function LayeredSlideshowPeekArt({ variant }: Pick<Props, 'variant'>) {
  if (variant === 'landscape') {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #ebe6dc 0%, #e0d9ce 45%, #b8cdb0 100%)',
        }}
        aria-hidden
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '12%',
            width: 28,
            height: 28,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '55%',
            background: 'rgba(95,148,104,0.9)',
            clipPath: 'polygon(0% 100%, 0% 55%, 35% 40%, 65% 60%, 100% 45%, 100% 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '38%',
            background: 'rgba(74,125,86,0.92)',
            clipPath: 'polygon(0% 100%, 20% 65%, 50% 75%, 80% 55%, 100% 70%, 100% 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #f7f4ee 0%, #e8e2d6 100%)',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          right: '8%',
          top: '18%',
          width: '42%',
          height: '42%',
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: '#6b9e72',
          clipPath: 'polygon(0 100%, 0 40%, 100% 55%, 100% 100%)',
        }}
      />
    </div>
  );
}
