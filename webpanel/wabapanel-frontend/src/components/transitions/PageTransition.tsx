'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Optional key override (e.g. onboarding step). Defaults to pathname. */
  animKey?: string | number;
};

/**
 * Soft blur + fade page transition.
 * Blurs out the previous view, then blurs in the new one on route change.
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

  pending.current = children;
  phaseRef.current = phase;
  renderKeyRef.current = renderKey;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
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

    clearTimers();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setRenderKey(key);
      setDisplay(pending.current);
      setPhase('idle');
      return;
    }

    setPhase('out');
    const outMs = 220;
    const inMs = 520;

    const t1 = window.setTimeout(() => {
      setRenderKey(key);
      setDisplay(pending.current);
      setPhase('in');
      const t2 = window.setTimeout(() => setPhase('idle'), inMs);
      timers.current.push(t2);
    }, outMs);
    timers.current.push(t1);

    return clearTimers;
  }, [key]);

  // First paint enter → idle
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
