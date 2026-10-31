import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ImageCompareAfterShirt, ImageCompareBeforeShirt } from './ImageCompareArt';

type Props = {
  beforeUrl?: string;
  afterUrl?: string;
  minHeight?: number;
};

export function ImageCompareSlider({ beforeUrl, afterUrl, minHeight = 320 }: Props) {
  const [position, setPosition] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    minHeight,
    borderRadius: 4,
    overflow: 'hidden',
    background: '#f4f4f4',
    touchAction: 'none',
    userSelect: 'none',
  };

  const layer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 32px',
    boxSizing: 'border-box',
  };

  const imageBox: CSSProperties = {
    width: '100%',
    maxWidth: 280,
    height: '100%',
    maxHeight: minHeight - 48,
  };

  const handleStyle: CSSProperties = {
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

  const tab: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 14,
    height: 8,
    background: '#ffffff',
    borderRadius: '0 0 2px 2px',
  };

  return (
    <div
      ref={trackRef}
      style={wrap}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Compare images"
    >
      <div style={layer}>
        <div style={imageBox}>
          {afterUrl ? (
            <img src={afterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <ImageCompareAfterShirt />
          )}
        </div>
      </div>

      <div
        style={{
          ...layer,
          clipPath: `inset(0 ${100 - position}% 0 0)`,
          zIndex: 2,
        }}
      >
        <div style={imageBox}>
          {beforeUrl ? (
            <img src={beforeUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <ImageCompareBeforeShirt />
          )}
        </div>
      </div>

      <div style={handleStyle}>
        <div style={tab} />
        <div style={knob}>
          <span aria-hidden>‹›</span>
        </div>
      </div>
    </div>
  );
}
