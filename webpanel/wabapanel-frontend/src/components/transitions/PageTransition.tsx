'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signalPageReady } from '@/stores/busyStore';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Optional key override (e.g. onboarding step). Defaults to pathname. */
  animKey?: string | number;
};

/**
 * Soft blur + fade page transition.
 * Blurs out the previous view, then blurs in the new one on route change.
 * Signals nav-busy when the new page has finished entering.
 */
export default function PageTransition({ children, className = '', animKey }: Props) {
  const pathname = usePathname();
  const key = animKey ?? pathname;
  const [phase, setPhase] = useState<'in' | 'out' | 'idle'>('in');
  const [renderKey, setRenderKey] = useState(key);
  const [display, setDisplay] = useState(children);
  const pending = useRef(children);
  const phaseRef = useRef(phase);
  const renderKeyRef = useRef(renderKey);
  const timers = useRef<number[]>([]);
  const hasNavigated = useRef(false);

  pending.current = children;
  phaseRef.current = phase;
  renderKeyRef.current = renderKey;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const markReady = () => {
    // Wait until the new view is painted, plus a short beat for page effects to settle.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => signalPageReady(), 280);
      });
    });
  };

  // Keep content fresh while staying on the same route
  useEffect(() => {
    if (key === renderKeyRef.current && phaseRef.current !== 'out') {
      setDisplay(children);
    }
  }, [children, key]);

  // Blur-out → swap → blur-in on route / key change
  useEffect(() => {
    if (key === renderKeyRef.current) return;

    hasNavigated.current = true;
    clearTimers();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setRenderKey(key);
      setDisplay(pending.current);
      setPhase('idle');
      markReady();
      return;
    }

    setPhase('out');
    const outMs = 220;
    const inMs = 520;

    const t1 = window.setTimeout(() => {
      setRenderKey(key);
      setDisplay(pending.current);
      setPhase('in');
      const t2 = window.setTimeout(() => {
        setPhase('idle');
        markReady();
      }, inMs);
      timers.current.push(t2);
    }, outMs);
    timers.current.push(t1);

    return clearTimers;
  }, [key]);

  // First paint enter → idle (do not clear nav busy on initial mount)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase('idle');
      return;
    }
    const t = window.setTimeout(() => setPhase('idle'), 520);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      key={String(renderKey)}
      className={`page-blur-transition page-blur-transition--${phase} ${className}`.trim()}
    >
      {display}
    </div>
  );
}
