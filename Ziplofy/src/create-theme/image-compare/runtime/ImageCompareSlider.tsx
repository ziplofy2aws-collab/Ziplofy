import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ImageCompareAfterShirt, ImageCompareBeforeShirt } from './ImageCompareArt';

type Props = {
  beforeUrl?: string;
  afterUrl?: string;
  direction?: 'horizontal' | 'vertical';
  textOnImages?: boolean;
  wrapStyle?: CSSProperties;
  mobileClass?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  minHeight?: number;
};

const labelStyle: CSSProperties = {
  position: 'absolute',
  top: 12,
  padding: '4px 10px',
  borderRadius: 4,
  background: 'rgba(0,0,0,0.55)',
  color: '#ffffff',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.02em',
  zIndex: 5,
  pointerEvents: 'none',
};

export function ImageCompareSlider({
  beforeUrl,
  afterUrl,
  direction = 'horizontal',
  textOnImages = false,
  wrapStyle,
  mobileClass,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  minHeight = 280,
}: Props) {
  const [position, setPosition] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === 'vertical';

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (isVertical) {
        const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
        setPosition((y / rect.height) * 100);
      } else {
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        setPosition((x / rect.width) * 100);
      }
    },
    [isVertical]
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    minHeight: wrapStyle?.aspectRatio ? undefined : minHeight,
    borderRadius: 4,
    overflow: 'hidden',
    background: '#f4f4f4',
    touchAction: 'none',
    userSelect: 'none',
    ...wrapStyle,
  };

  const layer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${24 + paddingTop}px ${32 + paddingRight}px ${24 + paddingBottom}px ${32 + paddingLeft}px`,
    boxSizing: 'border-box',
  };

  const imageBox: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 280,
    height: '100%',
    maxHeight: wrapStyle?.aspectRatio ? '100%' : minHeight - 48,
  };

  const handleStyle: CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${position}%`,
        transform: 'translateY(-50%)',
        height: 3,
        width: '100%',
        background: '#ffffff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
        zIndex: 4,
        cursor: 'ns-resize',
      }
    : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${position}%`,
        transform: 'translateX(-50%)',
        width: 3,
        background: '#ffffff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
        zIndex: 4,
        cursor: 'ew-resize',
      };

  const knob: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 600,
    letterSpacing: -2,
  };

  const tab: CSSProperties = isVertical
    ? {
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        width: 8,
        height: 14,
        background: '#ffffff',
        borderRadius: '0 0 2px 2px',
      }
    : {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 8,
        background: '#ffffff',
        borderRadius: '0 0 2px 2px',
      };

  const beforeClip = isVertical
    ? `inset(0 0 ${100 - position}% 0)`
    : `inset(0 ${100 - position}% 0 0)`;

  return (
    <div
      ref={trackRef}
      className={mobileClass || undefined}
      style={wrap}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      aria-label="Compare images"
    >
      <div style={layer}>
        <div style={imageBox}>
          {afterUrl ? (
            <img src={afterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <ImageCompareAfterShirt />
          )}
          {textOnImages ? <span style={{ ...labelStyle, right: 12, left: 'auto' }}>After</span> : null}
        </div>
      </div>

      <div style={{ ...layer, clipPath: beforeClip, zIndex: 2 }}>
        <div style={imageBox}>
          {beforeUrl ? (
            <img src={beforeUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <ImageCompareBeforeShirt />
          )}
          {textOnImages ? <span style={{ ...labelStyle, left: 12 }}>Before</span> : null}
        </div>
      </div>

      <div style={handleStyle}>
        <div style={tab} />
        <div style={knob}>
          <span aria-hidden>{isVertical ? '‹›' : '‹›'}</span>
        </div>
      </div>
    </div>
  );
}
