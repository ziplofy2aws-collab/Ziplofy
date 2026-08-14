import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  LIVE_GLOBE_DEMO_MARKERS,
  LIVE_GLOBE_LAND_POINTS,
} from './liveGlobeLandPoints';

const LAND_COLOR = '#9aa3ad';
const OCEAN_COLOR = '#eef1f4';
const ORDER_COLOR = '#8a3ffc';
const VISITOR_COLOR = '#00a0ac';

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const BASE_VIEW = { w: 1200, h: 620 };

export type LiveViewFlatMapHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
};

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * BASE_VIEW.w,
    y: ((90 - lat) / 180) * BASE_VIEW.h,
  };
}

/**
 * Shopify-style flat world map for Live View (pan + zoom).
 */
export const LiveViewFlatMap = forwardRef<LiveViewFlatMapHandle>(
  function LiveViewFlatMap(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1.15);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<{
      active: boolean;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap.clientWidth;
      const cssH = wrap.clientHeight;
      if (cssW < 2 || cssH < 2) return;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      ctx.fillStyle = OCEAN_COLOR;
      ctx.fillRect(0, 0, cssW, cssH);

      const fit = Math.min(cssW / BASE_VIEW.w, cssH / BASE_VIEW.h);
      const s = fit * scale;
      const mapW = BASE_VIEW.w * s;
      const mapH = BASE_VIEW.h * s;
      const originX = (cssW - mapW) / 2 + offset.x;
      const originY = (cssH - mapH) / 2 + offset.y;

      ctx.save();
      ctx.translate(originX, originY);
      ctx.scale(s, s);

      const dot = Math.max(0.55, 1.05 / Math.sqrt(scale));
      ctx.fillStyle = LAND_COLOR;
      for (const point of LIVE_GLOBE_LAND_POINTS) {
        const { x, y } = project(point.lat, point.lng);
        ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot);
      }

      const visitor = project(
        LIVE_GLOBE_DEMO_MARKERS.visitor.lat,
        LIVE_GLOBE_DEMO_MARKERS.visitor.lng,
      );
      const order = project(
        LIVE_GLOBE_DEMO_MARKERS.order.lat,
        LIVE_GLOBE_DEMO_MARKERS.order.lng,
      );

      // Visitor hex-ish marker
      ctx.fillStyle = VISITOR_COLOR;
      const vr = 4.2;
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = visitor.x + Math.cos(a) * vr;
        const py = visitor.y + Math.sin(a) * vr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Order pulse + dot
      ctx.fillStyle = ORDER_COLOR;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(order.x, order.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(order.x, order.y, 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }, [offset.x, offset.y, scale]);

    useEffect(() => {
      draw();
      const wrap = wrapRef.current;
      if (!wrap) return;

      let raf = 0;
      let lastW = -1;
      let lastH = -1;
      const tick = () => {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (w !== lastW || h !== lastH) {
          lastW = w;
          lastH = h;
          draw();
        }
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);

      return () => window.cancelAnimationFrame(raf);
    }, [draw]);

    useImperativeHandle(ref, () => ({
      zoomIn: () => setScale((s) => Math.min(MAX_SCALE, s * 1.22)),
      zoomOut: () => setScale((s) => Math.max(MIN_SCALE, s / 1.22)),
    }));

    const onPointerDown = (e: React.PointerEvent) => {
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: offset.x,
        originY: offset.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      setOffset({
        x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
      });
    };

    const onPointerUp = (e: React.PointerEvent) => {
      dragRef.current.active = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      setScale((s) => {
        const next = e.deltaY > 0 ? s / 1.08 : s * 1.08;
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      });
    };

    return (
      <div
        ref={wrapRef}
        className="relative h-full min-h-105 w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    );
  },
);
