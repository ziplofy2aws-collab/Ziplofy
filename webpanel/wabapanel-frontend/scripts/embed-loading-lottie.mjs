import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const lottiePath = path.join(root, 'public', 'animations', 'loading.lottie');
const b64 = fs.readFileSync(lottiePath).toString('base64');

const content = `/** Shared full-screen / page loading animation — embedded for zero-network paint. */
export const LOADING_ANIMATION_SRC = '/animations/loading.lottie';

const LOADING_ANIMATION_B64 = '${b64}';

function decodeBase64ToArrayBuffer(b64: string): ArrayBuffer {
  if (typeof atob === 'function') {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  const buf = Buffer.from(b64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/** Sync embedded bytes — available on first paint, no fetch. */
export const LOADING_ANIMATION_DATA: ArrayBuffer = decodeBase64ToArrayBuffer(LOADING_ANIMATION_B64);

let cachedData: ArrayBuffer | null = LOADING_ANIMATION_DATA;

/** Already embedded — resolves instantly. */
export function preloadLoadingAnimation(): Promise<ArrayBuffer | null> {
  return Promise.resolve(LOADING_ANIMATION_DATA);
}

export function getCachedLoadingAnimation(): ArrayBuffer | null {
  return cachedData;
}

/** Fresh copy for DotLottie (player may transfer/detach the buffer). */
export function getLoadingAnimationData(): ArrayBuffer {
  return LOADING_ANIMATION_DATA.slice(0);
}
`;

const panelOut = path.join(root, 'src', 'lib', 'loadingAnimation.ts');
const codiicOut = path.resolve(root, '..', '..', 'codiic', 'src', 'lib', 'loadingAnimation.ts');
fs.writeFileSync(panelOut, content);
fs.writeFileSync(codiicOut, content);
console.log('wrote', panelOut, content.length);
console.log('wrote', codiicOut, content.length);
