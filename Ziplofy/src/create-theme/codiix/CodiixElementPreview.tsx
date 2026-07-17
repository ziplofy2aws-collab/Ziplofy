import React, { useLayoutEffect, useRef, useState } from 'react';
import { getCreateThemeElement } from '../registry';
import { defaultPreviewForElement } from '../_shared/section-preview-helpers';
import { SectionPreviewVisual } from '../_shared/SectionPreviewVisual';

const PREVIEW_CANVAS_WIDTH = 480;
const PREVIEW_MAX_HEIGHT = 300;

/** Reuses the same catalog hover preview art as Add section modal. */
export function CodiixElementPreview({ elementId }: { elementId: string }) {
  const element = getCreateThemeElement(elementId);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.5, height: 170 });
  const slide = element ? defaultPreviewForElement(element) : null;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    let animationFrame = 0;
    const updateFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const availableWidth = Math.max(1, frame.clientWidth - 20);
        const contentHeight = Math.max(1, canvas.scrollHeight);
        const widthScale = availableWidth / PREVIEW_CANVAS_WIDTH;
        const heightScale = PREVIEW_MAX_HEIGHT / contentHeight;
        const scale = Math.min(1, widthScale, heightScale);
        const height = Math.ceil(contentHeight * scale) + 20;

        setFit((current) =>
          Math.abs(current.scale - scale) < 0.001 && current.height === height
            ? current
            : { scale, height },
        );
      });
    };

    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(frame);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [elementId, slide?.variant]);

  if (!element || !slide) return null;

  return (
    <div className="codiix-preview">
      <p className="codiix-preview__label">Preview · {element.label}</p>
      <div
        ref={frameRef}
        className="codiix-preview__frame"
        style={{ height: `${fit.height}px` }}
      >
        <div
          ref={canvasRef}
          className="codiix-preview__canvas"
          style={{
            width: `${PREVIEW_CANVAS_WIDTH}px`,
            transform: `translateX(-50%) scale(${fit.scale})`,
          }}
        >
          <SectionPreviewVisual variant={slide.variant} />
        </div>
      </div>
      <p className="codiix-preview__caption">
        This is how <strong>{element.label}</strong> looks
        {slide.caption ? ` — ${slide.caption}` : '.'}
      </p>
    </div>
  );
}
