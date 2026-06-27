import type { CSSProperties } from 'react';
import { HeroLandscapeBackdrop } from '../../hero/runtime/HeroLandscapeBackdrop';

/**
 * Full-bleed media for a single slide. Picks art by `peekVariant`:
 * - `figure`  → scenic backdrop + denim-jacket person
 * - `landscape` → lake/mountains scene with two figures
 * A merchant-set `imageUrl` always wins.
 */
export function LayeredSlideshowSlideMedia({
  imageUrl,
  peekVariant,
  figureWidth = '54%',
  figureHeight = '112%',
  figureMaxWidth = 480,
}: {
  imageUrl?: string;
  peekVariant: 'figure' | 'landscape';
  figureWidth?: string | number;
  figureHeight?: string | number;
  figureMaxWidth?: number;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
        }}
      />
    );
  }

  if (peekVariant === 'landscape') {
    return <HeroLandscapeBackdrop />;
  }

  return (
    <>
      <LayeredSlideshowBackdrop />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: figureWidth,
          maxWidth: figureMaxWidth,
          height: figureHeight,
          pointerEvents: 'none',
        }}
      >
        <LayeredSlideshowFigure />
      </div>
    </>
  );
}

/** Full-bleed scenic landscape behind the slide figure. */
export function LayeredSlideshowBackdrop({ style }: { style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4d9bd" />
          <stop offset="55%" stopColor="#eecaa6" />
          <stop offset="100%" stopColor="#e7c6a8" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="600" height="400" fill="url(#ls-sky)" />
      {/* soft sun glow */}
      <circle cx="372" cy="78" r="120" fill="#f7e7d4" opacity="0.5" />
      <circle cx="372" cy="74" r="40" fill="#fbf1e4" opacity="0.9" />

      {/* distant mountain range */}
      <path d="M0 196 L96 96 L182 184 L268 110 L360 198 L452 120 L546 200 L600 168 L600 260 L0 260 Z" fill="#9aa7a4" opacity="0.55" />
      <path d="M150 200 L250 118 L300 170 L300 200 Z" fill="#aab4b0" opacity="0.5" />
      {/* left rocky cliff */}
      <path d="M0 250 L70 120 L150 250 Z" fill="#8b9794" />
      <path d="M0 250 L70 120 L92 165 L40 250 Z" fill="#7c8a86" />
      {/* right mountains with snow caps */}
      <path d="M470 250 L548 122 L600 210 L600 250 Z" fill="#9ba6a3" />
      <path d="M548 122 L568 158 L530 162 Z" fill="#e9ece9" opacity="0.85" />

      {/* mid green ridge */}
      <path d="M0 246 L150 210 L320 250 L470 214 L600 244 L600 290 L0 290 Z" fill="#6f9a74" />

      {/* left forest hill with pine silhouette */}
      <path
        d="M0 248 L18 230 L30 248 L46 226 L60 248 L78 228 L92 250 L112 232 L128 252 L150 236 L168 256 L168 400 L0 400 Z"
        fill="#3f7a52"
      />
      {/* right forest hill with pine silhouette */}
      <path
        d="M600 246 L584 228 L570 248 L552 228 L538 250 L520 230 L504 252 L484 234 L468 256 L468 400 L600 400 Z"
        fill="#3f7a52"
      />

      {/* foreground rolling field */}
      <path d="M0 300 L300 282 L600 300 L600 400 L0 400 Z" fill="#5a9266" />
      <path d="M0 338 L300 320 L600 338 L600 400 L0 400 Z" fill="#4d8459" opacity="0.92" />
    </svg>
  );
}

/** Stylised person wearing a denim jacket (default slide figure). */
export function LayeredSlideshowFigure({
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
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
          ...style,
        }}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 240 300"
      preserveAspectRatio="xMidYMax meet"
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      aria-hidden
    >
      {/* hair back */}
      <path d="M78 70 Q78 18 120 18 Q162 18 162 70 L162 96 Q120 110 78 96 Z" fill="#6e4a30" />
      {/* neck */}
      <rect x="106" y="92" width="28" height="34" rx="10" fill="#d49a72" />
      {/* face */}
      <path d="M88 66 Q88 24 120 24 Q152 24 152 66 Q152 102 120 104 Q88 102 88 66 Z" fill="#e6b189" />
      {/* hair top + side fringe */}
      <path d="M86 66 Q84 26 120 22 Q156 26 154 66 Q150 50 120 48 Q96 50 92 70 Z" fill="#5e3d27" />
      <path d="M150 58 Q156 78 150 92 L142 86 Q146 72 144 60 Z" fill="#5e3d27" />

      {/* white t-shirt */}
      <path d="M84 132 Q120 150 156 132 L168 168 L72 168 Z" fill="#f1f0ec" />
      <path d="M108 120 L120 142 L132 120 Q120 134 108 120 Z" fill="#e3e2dd" />

      {/* denim jacket body */}
      <path d="M58 150 Q120 176 182 150 L196 300 L44 300 Z" fill="#3f72b8" />
      {/* jacket front opening (white tee showing) */}
      <path d="M112 156 L128 156 L132 300 L108 300 Z" fill="#eceae4" />
      {/* jacket panels shading */}
      <path d="M58 150 Q86 166 110 172 L110 300 L44 300 Z" fill="#39669f" />
      <path d="M182 150 Q156 166 130 172 L130 300 L196 300 Z" fill="#3a68a4" />
      {/* collar */}
      <path d="M104 142 L120 158 L100 162 Z" fill="#4d7ec4" />
      <path d="M136 142 L120 158 L140 162 Z" fill="#4d7ec4" />
      {/* buttons */}
      <circle cx="120" cy="190" r="3.4" fill="#eef0f2" />
      <circle cx="120" cy="218" r="3.4" fill="#eef0f2" />
      <circle cx="120" cy="246" r="3.4" fill="#eef0f2" />
      <circle cx="120" cy="274" r="3.4" fill="#eef0f2" />

      {/* left arm */}
      <path d="M58 150 L40 250 L66 256 L86 168 Z" fill="#3a68a4" />
      {/* right arm with rolled cuff + hand in pocket */}
      <path d="M182 150 L200 244 L174 252 L154 168 Z" fill="#3a68a4" />
      <path d="M172 236 L200 244 L196 262 L168 254 Z" fill="#6f99d2" />
      <path d="M150 256 Q166 248 182 258 L178 282 L152 280 Z" fill="#e0aa82" />
    </svg>
  );
}

/** Right-edge peek of the next slide. */
export function LayeredSlideshowPeek({ variant }: { variant: 'figure' | 'landscape' }) {
  if (variant === 'figure') {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #f1d9bf 0%, #e9c7a4 60%, #5a9266 100%)',
          overflow: 'hidden',
        }}
        aria-hidden
      >
        <div
          style={{
            position: 'absolute',
            left: '-40%',
            bottom: 0,
            width: '120%',
            height: '70%',
            background: '#cf5b46',
            borderTopLeftRadius: '60% 40%',
            borderTopRightRadius: '50% 36%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '8%',
            top: '14%',
            width: '46%',
            height: '26%',
            borderRadius: '50%',
            background: '#27201c',
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
        background: 'linear-gradient(180deg, #ebe6dc 0%, #e0d9ce 45%, #b8cdb0 100%)',
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '12%',
          width: 22,
          height: 22,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '52%',
          background: 'rgba(95,148,104,0.92)',
          clipPath: 'polygon(0% 100%, 0% 55%, 35% 40%, 65% 60%, 100% 45%, 100% 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '36%',
          background: 'rgba(74,125,86,0.95)',
          clipPath: 'polygon(0% 100%, 20% 65%, 50% 75%, 80% 55%, 100% 70%, 100% 100%)',
        }}
      />
    </div>
  );
}
