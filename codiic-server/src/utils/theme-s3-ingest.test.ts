import { describe, expect, it } from 'vitest';
import { resolveThemeContentRootSuffix } from './theme-s3-ingest';

describe('resolveThemeContentRootSuffix', () => {
  it('returns empty suffix when index.html is at the upload root', () => {
    const suffix = resolveThemeContentRootSuffix([
      { relativePath: 'index.html' },
      { relativePath: 'css/style.css' },
    ]);
    expect(suffix).toBe('');
  });

  it('returns the folder name when index.html is inside an uploaded folder', () => {
    const suffix = resolveThemeContentRootSuffix([
      { relativePath: 'Gromming/index.html' },
      { relativePath: 'Gromming/css/style.css' },
    ]);
    expect(suffix).toBe('Gromming');
  });

  it('uses the shallowest index.html directory when multiple exist', () => {
    const suffix = resolveThemeContentRootSuffix([
      { relativePath: 'Gromming/index.html' },
      { relativePath: 'Gromming/pages/shop/index.html' },
    ]);
    expect(suffix).toBe('Gromming');
  });

  it('falls back to a single shared top-level folder when index.html is missing', () => {
    const suffix = resolveThemeContentRootSuffix([
      { relativePath: 'Gromming/home.html' },
      { relativePath: 'Gromming/css/style.css' },
    ]);
    expect(suffix).toBe('Gromming');
  });
});
