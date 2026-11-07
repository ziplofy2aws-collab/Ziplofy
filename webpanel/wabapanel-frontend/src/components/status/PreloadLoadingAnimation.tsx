'use client';

import { DotLottie } from '@lottiefiles/dotlottie-web';
import { preloadLoadingAnimation } from '@/lib/loadingAnimation';

// Run at module load — not waiting for useEffect — so WASM is ready before SSO/layout loaders.
void preloadLoadingAnimation();
try {
  void DotLottie.preload?.();
} catch {
  /* ignore */
}

/** Warm DotLottie WASM + embedded animation as soon as the app boots. */
export default function PreloadLoadingAnimation() {
  return null;
}
