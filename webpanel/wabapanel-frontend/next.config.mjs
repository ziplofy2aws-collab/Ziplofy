import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const informaticSrc = path.join(repoRoot, 'remote-themes/informatic/src');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Large vendored create-theme/theme-pack source tree carries pre-existing
  // lint+type debt — don't let it block production builds.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // src/pages/ holds vendored react-router pages — renamed to src/spa-pages so
  // the Pages Router never tries to route them.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // remote-themes/informatic is a gitignored build artifact — use the local
      // stub (same fallback the renderer uses) when it isn't materialized.
      '@informatic-theme': fs.existsSync(path.join(informaticSrc, 'index.tsx'))
        ? informaticSrc
        : path.join(__dirname, 'src/shims/informatic-theme'),
      // Ported create-theme builder shims (see src/shims/)
      '@render-store/sdk': path.join(__dirname, 'src/shims/render-store-sdk.tsx'),
      'react-router-dom': path.join(__dirname, 'src/shims/react-router-dom.tsx'),
      '@codiic/create-theme': path.join(__dirname, 'src/create-theme'),
    };
    return config;
  },
  experimental: {
    // Allow importing Informatic theme source from ../../remote-themes
    externalDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/remote-themes/:path*',
        destination: '/api/remote-themes/:path*',
      },
    ];
  },
};

export default nextConfig;
