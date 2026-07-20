import { useEffect, useState } from 'react';
import { isThemeEditorPreview } from '@/utils/theme-editor-preview';

/** Reactive check for theme editor iframe (class on `<html>`). */
export function useThemeEditorPreview(): boolean {
  const [active, setActive] = useState(() => isThemeEditorPreview());

  useEffect(() => {
    setActive(isThemeEditorPreview());
    const root = document.documentElement;
    const obs = new MutationObserver(() => setActive(isThemeEditorPreview()));
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return active;
}
