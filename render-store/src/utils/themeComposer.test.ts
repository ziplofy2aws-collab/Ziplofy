import { describe, expect, it } from 'vitest';
import { isComposerThemeConfig, shouldUseComposerRuntime } from './themeComposer';

describe('themeComposer', () => {
  it('detects composer-shaped theme config', () => {
    expect(isComposerThemeConfig({ sections: { hero: {} } })).toBe(true);
    expect(isComposerThemeConfig({ settings: {} })).toBe(false);
    expect(isComposerThemeConfig(null)).toBe(false);
  });

  it('routes store-custom themes to composer', () => {
    expect(
      shouldUseComposerRuntime({
        isStoreCustomTheme: true,
        themeConfig: { sections: {} },
        remoteThemeJsUrl: null,
      })
    ).toBe(true);
  });

  it('does not route catalog JSON themes to composer without store-custom flag', () => {
    expect(
      shouldUseComposerRuntime({
        isStoreCustomTheme: false,
        themeConfig: { sections: { hero: {} } },
        remoteThemeJsUrl: null,
      })
    ).toBe(false);
  });

  it('routes catalog themes with theme.js to remote bundle', () => {
    expect(
      shouldUseComposerRuntime({
        isStoreCustomTheme: false,
        themeConfig: { sections: { hero: {} } },
        remoteThemeJsUrl: '/api/themes/installed/s1/t1/remoteThemeDist/theme.js',
      })
    ).toBe(false);
  });
});
