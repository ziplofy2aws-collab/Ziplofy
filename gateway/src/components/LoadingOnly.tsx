import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/** Full-viewport loader — animation only, no copy. */
export default function LoadingOnly() {
  return (
    <div
      className="shell"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
      }}
    >
      <div style={{ width: 176, height: 176, maxWidth: '42vw', maxHeight: '42vw' }}>
        <DotLottieReact
          src="/animations/loading.lottie"
          loop
          autoplay
          speed={0.55}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
