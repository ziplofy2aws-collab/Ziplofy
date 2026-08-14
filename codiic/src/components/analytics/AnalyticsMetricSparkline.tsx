import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { ANALYTICS_GROW_TRANSITION } from './analyticsChartMotion';

export function AnalyticsMetricSparkline({
  values,
}: {
  values?: number[] | null;
}) {
  const path = useMemo(() => {
    const series = (values ?? []).filter((n) => Number.isFinite(n));
    if (series.length < 2) return null;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    return series
      .map((value, index) => {
        const x = (index / (series.length - 1)) * 120;
        const y = 24 - ((value - min) / span) * 20;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values]);

  if (!path) {
    return (
      <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-[#c9cdd1]" aria-hidden>
        <line x1="0" y1="24" x2="120" y2="24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-[#005bd3]" aria-hidden>
      <motion.path
        key={path}
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={ANALYTICS_GROW_TRANSITION}
      />
    </svg>
  );
}
