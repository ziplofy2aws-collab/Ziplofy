/**
 * Named re-exports for remote theme bundles.
 * Vite prebundles `react-dom` as CJS — keep explicit named exports (not `export *`).
 */
export { createPortal, flushSync } from 'react-dom';
export { default } from 'react-dom';
