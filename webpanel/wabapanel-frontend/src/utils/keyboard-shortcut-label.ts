/** Platform-aware keyboard shortcut labels for the theme editor chrome. */

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.platform || '';
  return /Mac|iPhone|iPad|iPod/i.test(platform);
}

/** Modifier used with letter keys: ⌘ on Apple, Ctrl elsewhere. */
export function modShortcutLabel(key: string): string {
  const k = key.trim().toUpperCase();
  return isApplePlatform() ? `⌘${k}` : `Ctrl+${k}`;
}

/** Shift + letter: ⇧I on Apple, Shift+I elsewhere. */
export function shiftShortcutLabel(key: string): string {
  const k = key.trim().toUpperCase();
  return isApplePlatform() ? `⇧${k}` : `Shift+${k}`;
}
