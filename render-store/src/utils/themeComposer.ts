/** True when themeConfig matches the create-theme composer shape (sections map). */
export function isComposerThemeConfig(
  config: Record<string, unknown> | null | undefined
): boolean {
  if (!config || typeof config !== 'object') return false;
  const sections = (config as { sections?: unknown }).sections;
  return Boolean(sections && typeof sections === 'object');
}

/** Route to create-theme composer vs remote React theme bundle. */
export function shouldUseComposerRuntime(opts: {
  isStoreCustomTheme: boolean;
  themeConfig: Record<string, unknown> | null;
  remoteThemeJsUrl: string | null;
}): boolean {
  return opts.isStoreCustomTheme && Boolean(opts.themeConfig);
}
