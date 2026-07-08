import { describe, expect, it } from 'vitest';
import { rewriteRemoteThemeImports } from './rewriteRemoteThemeImports';

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
});
