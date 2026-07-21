import { useCallback, useEffect, useRef, useState } from 'react';

/** Bumps state at most once per animation frame (batches rapid updates). */
export function useRafBatchedCounter(): [number, () => void] {
  const [tick, setTick] = useState(0);
  const frameRef = useRef(0);

  const bump = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      setTick((n) => n + 1);
    });
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  return [tick, bump];
}
