import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const informaticSrc = path.join(repoRoot, 'remote-themes/informatic/src');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@informatic-theme': informaticSrc,
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
