import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

/** Wait for typing to pause before starting the preview sync bar. */
export const PREVIEW_EDIT_DEBOUNCE_MS = 420;

/** Must match `.preview-sync-progress-bar` animation duration in create-theme-chrome.css */
export const PREVIEW_SYNC_BAR_MS = 1150;

export function usePreviewEditSync(values: Record<string, string | boolean>) {
  const [committedValues, setCommittedValues] = useState(values);
  const debouncedValues = useDebouncedValue(values, PREVIEW_EDIT_DEBOUNCE_MS);
  const [barRunKey, setBarRunKey] = useState(0);
  const skipBarOnceRef = useRef(true);
  const pendingCommitRef = useRef<Record<string, string | boolean> | null>(null);

  /** User is still editing — hide/stop the progress line and cancel any in-flight commit. */
  useEffect(() => {
    pendingCommitRef.current = null;
    setBarRunKey(0);
  }, [values]);

  /** Debounce window ended — play the line, then commit on animation end. */
  useEffect(() => {
    if (skipBarOnceRef.current) {
      skipBarOnceRef.current = false;
      setCommittedValues(debouncedValues);
      return;
    }
    pendingCommitRef.current = debouncedValues;
    // New key remounts the bar so the CSS animation always restarts.
    setBarRunKey((k) => k + 1);
  }, [debouncedValues]);

  /** If the animation event is missed, still commit after the bar duration. */
  useEffect(() => {
    if (barRunKey < 1) return;
    const failsafe = window.setTimeout(() => {
      const pending = pendingCommitRef.current;
      if (!pending) return;
      pendingCommitRef.current = null;
      setCommittedValues(pending);
      setBarRunKey(0);
    }, PREVIEW_SYNC_BAR_MS + 80);
    return () => window.clearTimeout(failsafe);
  }, [barRunKey]);

  const onPreviewBarComplete = useCallback(() => {
    const pending = pendingCommitRef.current;
    if (!pending) return;
    pendingCommitRef.current = null;
    setCommittedValues(pending);
    setBarRunKey(0);
  }, []);

  const seedCommittedPreview = useCallback((next: Record<string, string | boolean>) => {
    skipBarOnceRef.current = true;
    pendingCommitRef.current = null;
    setCommittedValues(next);
    setBarRunKey(0);
  }, []);

  const commitPreviewNow = useCallback(() => {
    pendingCommitRef.current = null;
    setCommittedValues(values);
    setBarRunKey(0);
  }, [values]);

  return {
    committedValues,
    previewBarRunKey: barRunKey,
    onPreviewBarComplete,
    seedCommittedPreview,
    commitPreviewNow,
  };
}
