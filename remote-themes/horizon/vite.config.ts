import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const external = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-router',
  'react-router-dom',
  '@render-store/sdk',
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@render-store/sdk': path.resolve(__dirname, '../../render-store/src/sdk/index.ts'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ZiplofyThemeHorizon',
      formats: ['es'],
      fileName: 'theme',
    },
    rollupOptions: {
      external,
      output: {
        assetFileNames: 'theme.[ext]',
        preserveModules: false,
      },
    },
    emptyOutDir: true,
    sourcemap: true,
  },
});
