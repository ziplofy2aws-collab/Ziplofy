import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ziplofyRoot = path.resolve(__dirname, '../../codiic');
const renderStoreRoot = path.resolve(__dirname, '..');
const ziplofyRequire = createRequire(path.join(ziplofyRoot, 'package.json'));

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
 * When bundling @codiic/create-theme sources from ../codiic, resolve bare imports
 * against codiic's node_modules (heroicons, MUI, etc.). Packages already installed
 * in render-store (react, axios, …) are left to Vite's default browser resolution.
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
      if (renderStoreHasPackage(source)) return null;
      try {
        return ziplofyRequire.resolve(source);
      } catch {
        return null;
      }
    },
  };
}
