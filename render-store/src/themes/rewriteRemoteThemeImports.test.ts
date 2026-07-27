import { describe, expect, it } from 'vitest';
import {
  patchRemoteThemeFeaturedCollectionLimitTdZ,
  rewriteRemoteThemeImports,
} from './rewriteRemoteThemeImports';

describe('rewriteRemoteThemeImports', () => {
  it('rewrites bare react-dom imports', () => {
    const source = `import { createPortal } from "react-dom";`;
    const out = rewriteRemoteThemeImports(source, 'https://shop.example.com');
    expect(out).not.toContain('from "react-dom"');
    expect(out).toMatch(/react-dom(\.ts|\.js)"/);
  });

  it('rewrites react, sdk, and router imports', () => {
    const source = [
      'import { useState } from "react";',
      'import { jsx } from "react/jsx-runtime";',
      'import { Link } from "react-router-dom";',
      'import { useStorefront } from "@render-store/sdk";',
    ].join('\n');
    const out = rewriteRemoteThemeImports(source, 'http://localhost:5180');
    expect(out).not.toContain('from "react"');
    expect(out).not.toContain('from "react/jsx-runtime"');
    expect(out).not.toContain('from "react-router-dom"');
    expect(out).not.toContain('from "@render-store/sdk"');
    expect(out).toContain('http://localhost:5180');
  });

  it('inlines productsToShow when featured-collection limit is used before init', () => {
    const source = [
      'b = r(i, `${s}.collectionHandle`, "products"), _ = wd({ collectionHandle: b, limit: f }), $ = M(() => {',
      '  return { limit: Math.max(1, x(i, `${s}.productsToShow`, 8)) };',
      '}, [i, s]), { limit: f } = $;',
    ].join('\n');
    const out = patchRemoteThemeFeaturedCollectionLimitTdZ(source);
    expect(out).not.toContain('limit: f })');
    expect(out).toContain('limit: Math.max(1, x(i, `${s}.productsToShow`, 8)) })');
    expect(out).toContain('{ limit: f } = $');
  });

  it('does not rewrite function parameter destructuring (would be Invalid destructuring assignment target)', () => {
    const source = [
      'function zd({',
      '  collectionHandle: e,',
      '  limit: t',
      '}) {',
      '  return ie(() => { a(i, s, { page: 1, limit: t }); });',
      '}',
      'const D = zd({ collectionHandle: F, limit: H }).slice(0, H);',
    ].join('\n');
    const out = patchRemoteThemeFeaturedCollectionLimitTdZ(source);
    expect(out).toContain('limit: t\n})');
    expect(out).not.toMatch(/function zd\(\{[\s\S]*?limit:\s*8/);
  });
});
