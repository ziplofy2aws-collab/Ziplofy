import type { CSSProperties } from 'react';

/** Full-frame landscape + figure hero art (matches add-section modal preview). */
export function SlideshowFullFrameLandscapeArt({
  imageUrl,
  style,
}: {
  imageUrl?: string;
  style?: CSSProperties;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{
          ...style,
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, ...style }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #ebe6dc 0%, #e0d9ce 45%, #c5d4b8 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '9%',
          width: 44,
          height: 44,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '48%',
          background: 'rgba(95,148,104,0.88)',
          clipPath:
            'polygon(0% 100%, 0% 50%, 18% 58%, 38% 38%, 58% 52%, 78% 32%, 100% 48%, 100% 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32%',
          background: 'rgba(74,125,86,0.92)',
          clipPath: 'polygon(0% 100%, 12% 62%, 35% 72%, 55% 55%, 78% 68%, 100% 58%, 100% 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          display: 'flex',
          height: '58%',
          width: '42%',
          transform: 'translateX(-8%)',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
              top: '18%',
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
              top: '24%',
              width: '94%',
              height: '76%',
              transform: 'translateX(-50%)',
              overflow: 'hidden',
              borderTopLeftRadius: '26%',
              borderTopRightRadius: '26%',
              background: '#4a7fc4',
            }}
          >
            <div style={{ position: 'absolute', left: '9%', top: 0, width: '13%', height: '100%', background: '#3a6dad' }} />
            <div style={{ position: 'absolute', right: '9%', top: 0, width: '13%', height: '100%', background: '#3a6dad' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
