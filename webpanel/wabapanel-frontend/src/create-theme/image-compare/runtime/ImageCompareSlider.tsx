import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ImageCompareAfterShirt, ImageCompareBeforeShirt } from './ImageCompareArt';

type Props = {
  beforeUrl?: string;
  afterUrl?: string;
  direction?: 'horizontal' | 'vertical';
  textOnImages?: boolean;
  sliderColor?: string;
  sliderInnerColor?: string;
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
  sliderColor = '#ffffff',
  sliderInnerColor = '#ffffff',
  wrapStyle,
  mobileClass,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  minHeight,
}: Props) {
  const [position, setPosition] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === 'vertical';
  const aspectRatio = wrapStyle?.aspectRatio;
  const hasAspect = Boolean(aspectRatio);

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

  // Width drives height via aspect-ratio. Absolute layers fill the frame so
  // intrinsic image/SVG size cannot override Landscape / Portrait / Square.
  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    borderRadius: 4,
    overflow: 'hidden',
    background: '#f4f4f4',
    touchAction: 'none',
    userSelect: 'none',
    boxSizing: 'border-box',
    ...wrapStyle,
    ...(hasAspect
      ? {
          aspectRatio,
          height: 'auto',
          minHeight: undefined,
        }
      : {
          minHeight: wrapStyle?.minHeight ?? minHeight,
        }),
  };

  const layer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hasAspect
      ? 0
      : `${24 + paddingTop}px ${32 + paddingRight}px ${24 + paddingBottom}px ${32 + paddingLeft}px`,
    boxSizing: 'border-box',
  };

  const imageBox: CSSProperties = hasAspect
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }
    : {
        position: 'relative',
        width: '100%',
        maxWidth: 280,
        height: '100%',
        maxHeight:
          typeof minHeight === 'number' ? Math.max(120, minHeight - 48) : undefined,
      };

  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: hasAspect ? 'cover' : 'contain',
    objectPosition: 'center',
    display: 'block',
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
        background: sliderColor,
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
        background: sliderColor,
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
    background: sliderInnerColor,
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
        background: sliderColor,
        borderRadius: '0 0 2px 2px',
      }
    : {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 8,
        background: sliderColor,
        borderRadius: '0 0 2px 2px',
      };

  const beforeClip = isVertical
    ? `inset(0 0 ${100 - position}% 0)`
    : `inset(0 ${100 - position}% 0 0)`;

  const artWrap: CSSProperties = hasAspect
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }
    : { width: '100%', height: '100%' };

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
            <img src={afterUrl} alt="" style={mediaStyle} />
          ) : (
            <div style={artWrap}>
              <ImageCompareAfterShirt />
            </div>
          )}
          {textOnImages ? <span style={{ ...labelStyle, right: 12, left: 'auto' }}>After</span> : null}
        </div>
      </div>

      <div style={{ ...layer, clipPath: beforeClip, zIndex: 2 }}>
        <div style={imageBox}>
          {beforeUrl ? (
            <img src={beforeUrl} alt="" style={mediaStyle} />
          ) : (
            <div style={artWrap}>
              <ImageCompareBeforeShirt />
            </div>
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
