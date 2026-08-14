import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

export const ANALYTICS_CHART_ANIMATION_MS = 750;

export const ANALYTICS_GROW_TRANSITION = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function analyticsReplayKey(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function AnalyticsGrowBar({
  widthPct,
  replayKey,
  className = 'bg-[#00a0ac]',
}: {
  widthPct: number;
  replayKey?: string | number;
  className?: string;
}) {
  const scaleX = Math.min(Math.max(widthPct, 0), 100) / 100;
  return (
    <motion.div
      key={replayKey}
      className={`h-full w-full origin-left rounded-sm ${className}`.trim()}
      initial={{ scaleX: 0 }}
      animate={{ scaleX }}
      transition={ANALYTICS_GROW_TRANSITION}
    />
  );
}

export function useAnalyticsReplayKey(value: unknown): string {
  return useMemo(() => analyticsReplayKey(value), [value]);
}
