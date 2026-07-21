import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const DURATION_MS = 2200;

/**
 * Full-screen soft wavy gradient border while the theme editor switches pages.
 * Self-contained styles (no mask hacks) so it always paints.
 */
export function PageSwitchGlow({ runKey }: { runKey: number }) {
  const [activeKey, setActiveKey] = useState(0);

  useEffect(() => {
    if (runKey <= 0) return;
    setActiveKey(runKey);
    const t = window.setTimeout(() => setActiveKey(0), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [runKey]);

  if (!activeKey || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <style>{CSS}</style>
      <div className="ctpsg" key={activeKey} aria-hidden>
        <span className="ctpsg__edge ctpsg__edge--t" />
        <span className="ctpsg__edge ctpsg__edge--r" />
        <span className="ctpsg__edge ctpsg__edge--b" />
        <span className="ctpsg__edge ctpsg__edge--l" />
      </div>
    </>,
    document.body,
  );
}

const CSS = `
.ctpsg {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  animation: ctpsg-fade ${DURATION_MS}ms ease-in-out forwards;
}
.ctpsg__edge {
  position: absolute;
  display: block;
  pointer-events: none;
}
.ctpsg__edge--t,
.ctpsg__edge--b {
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.35) 0%,
    rgba(96, 165, 250, 1) 15%,
    rgba(167, 139, 250, 0.9) 30%,
    rgba(129, 140, 248, 0.4) 45%,
    rgba(34, 211, 238, 1) 60%,
    rgba(244, 114, 182, 0.95) 78%,
    rgba(96, 165, 250, 0.5) 92%,
    rgba(99, 102, 241, 0.35) 100%
  );
  background-size: 220% 100%;
  animation: ctpsg-wave-x 2.4s linear infinite;
  box-shadow: 0 0 18px 3px rgba(111, 134, 255, 0.65);
}
.ctpsg__edge--t { top: 0; }
.ctpsg__edge--b {
  bottom: 0;
  animation-direction: reverse;
}
.ctpsg__edge--l,
.ctpsg__edge--r {
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(
    180deg,
    rgba(99, 102, 241, 0.35) 0%,
    rgba(167, 139, 250, 1) 18%,
    rgba(96, 165, 250, 0.9) 34%,
    rgba(129, 140, 248, 0.4) 48%,
    rgba(244, 114, 182, 1) 64%,
    rgba(34, 211, 238, 0.95) 80%,
    rgba(167, 139, 250, 0.5) 92%,
    rgba(99, 102, 241, 0.35) 100%
  );
  background-size: 100% 220%;
  animation: ctpsg-wave-y 2.8s linear infinite;
  box-shadow: 0 0 18px 3px rgba(151, 120, 255, 0.6);
}
.ctpsg__edge--l { left: 0; }
.ctpsg__edge--r {
  right: 0;
  animation-direction: reverse;
}
@keyframes ctpsg-wave-x {
  from { background-position: 0% 0; }
  to { background-position: 220% 0; }
}
@keyframes ctpsg-wave-y {
  from { background-position: 0 0%; }
  to { background-position: 0 220%; }
}
@keyframes ctpsg-fade {
  0% { opacity: 0; }
  12% { opacity: 1; }
  72% { opacity: 1; }
  100% { opacity: 0; }
}
`;
