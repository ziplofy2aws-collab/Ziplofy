import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ziplofyRoot = path.resolve(__dirname, '../../codiic');
const renderStoreRoot = path.resolve(__dirname, '..');
const ziplofyRequire = createRequire(path.join(ziplofyRoot, 'package.json'));
const renderStoreRequire = createRequire(path.join(renderStoreRoot, 'package.json'));

/**
 * Only these packages need Node createRequire from outside-root (@codiic) importers.
 * Everything else must stay on Vite's browser/ESM resolution — createRequire points at
 * CJS entrypoints that break named/default ESM imports in the browser (react, toast, etc.).
 */
const FORCE_NODE_RESOLVE = new Set(['qrcode']);

function packageRoot(specifier: string): string {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split('/')[0] ?? specifier;
}

function renderStoreHasPackage(specifier: string): boolean {
  return fs.existsSync(path.join(renderStoreRoot, 'node_modules', packageRoot(specifier)));
}

/**
 * When bundling @codiic/create-theme sources from ../codiic:
 * - Force-resolve only known hard cases (qrcode) from render-store node_modules
 * - Leave browser packages to Vite so ESM exports work
 * - Fall back to codiic node_modules for deps that exist only there
 */
export function resolveZiplofyNodeModules(): Plugin {
  return {
    name: 'resolve-ziplofy-node-modules',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null;
      const normalizedImporter = importer.replace(/\\/g, '/');
      if (!normalizedImporter.includes('/codiic/')) return null;
      if (
        source.startsWith('.') ||
        source.startsWith('\0') ||
        path.isAbsolute(source) ||
        source.startsWith('@codiic/') ||
        source.startsWith('@render-store/')
      ) {
        return null;
      }

      const root = packageRoot(source);

      if (FORCE_NODE_RESOLVE.has(root) && renderStoreHasPackage(source)) {
        try {
          return renderStoreRequire.resolve(source);
        } catch {
          return null;
        }
      }

      // Let Vite resolve packages that already exist in render-store.
      if (renderStoreHasPackage(source)) {
        return null;
      }

      try {
        return ziplofyRequire.resolve(source);
      } catch {
        return null;
      }
    },
  };
}
