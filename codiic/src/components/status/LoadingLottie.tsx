import React, { useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { getLoadingAnimationData } from '../../lib/loadingAnimation';

try {
  void DotLottie.preload?.();
} catch {
  /* ignore */
}

type LoadingLottieProps = {
  className?: string;
  style?: React.CSSProperties;
};

/** Instant embedded Lottie — no fetch, no fade gate, WASM preloaded at import. */
export default function LoadingLottie({ className = '', style }: LoadingLottieProps) {
  const data = useMemo(() => getLoadingAnimationData(), []);

  return (
    <div className={`relative ${className}`.trim()} style={style}>
      <DotLottieReact
        data={data}
        loop
        autoplay
        speed={0.55}
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
        layout={{ fit: 'contain', align: [0.5, 0.5] }}
      />
    </div>
  );
}
