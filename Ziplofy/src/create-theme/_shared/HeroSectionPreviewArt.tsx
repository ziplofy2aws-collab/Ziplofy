import React from 'react';

/** Flat landscape scene (mountains, lake, boat) — Shopify hero add-section art. */
export function HeroLandscapeIllustration() {
  return (
    <>
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#ebe6dc] via-[#e0d9ce] to-[#c5d4b8]"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-[9%] h-11 w-11 -translate-x-1/2 rounded-full bg-white shadow-sm"
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[48%] bg-[#5f9468]/88"
        style={{
          clipPath:
            'polygon(0% 100%, 0% 50%, 18% 58%, 38% 38%, 58% 52%, 78% 32%, 100% 48%, 100% 100%)',
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[32%] bg-[#4a7d56]/92"
        style={{
          clipPath: 'polygon(0% 100%, 12% 62%, 35% 72%, 55% 55%, 78% 68%, 100% 58%, 100% 100%)',
        }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/2 flex h-[58%] w-[42%] -translate-x-[8%] justify-center"
        aria-hidden
      >
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-[4%] h-[20%] w-[36%] -translate-x-1/2 rounded-full bg-[#e8c4a8]" />
          <div className="absolute left-1/2 top-[18%] h-[22%] w-[50%] -translate-x-1/2 rounded-t-md bg-white" />
          <div className="absolute left-1/2 top-[24%] h-[76%] w-[94%] -translate-x-1/2 overflow-hidden rounded-t-[26%] bg-[#4a7fc4]">
            <div className="absolute left-[9%] top-0 h-full w-[13%] bg-[#3a6dad]" />
            <div className="absolute right-[9%] top-0 h-full w-[13%] bg-[#3a6dad]" />
          </div>
        </div>
      </div>
    </>
  );
}

type FrameProps = {
  children: React.ReactNode;
  size?: 'modal' | 'compact';
};

/** Same landscape scene as `HeroLandscapeBackdrop` (runtime hero). */
function HeroClassicSceneBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #e8b89a 0%, #c9a07a 18%, #8fb8a8 42%, #4a8f9c 68%, #2d6478 100%)',
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="1200" height="600" fill="#e8b89a" />
        <ellipse cx="600" cy="120" rx="280" ry="80" fill="#f5d4b8" opacity="0.9" />
        <circle cx="180" cy="90" r="36" fill="#fff8f0" opacity="0.85" />
        <path
          d="M0 380 L120 320 L240 360 L400 280 L560 340 L720 260 L880 300 L1040 240 L1200 280 L1200 600 L0 600 Z"
          fill="#3d6b5a"
        />
        <path
          d="M0 400 L200 360 L380 390 L520 330 L680 370 L860 310 L1000 350 L1200 320 L1200 600 L0 600 Z"
          fill="#2d8a7a"
        />
        <path d="M0 420 Q600 380 1200 420 L1200 600 L0 600 Z" fill="#3a9e8c" />
        <ellipse cx="420" cy="430" rx="200" ry="28" fill="#1f5f6e" opacity="0.35" />
        <ellipse cx="340" cy="518" rx="88" ry="52" fill="#3d2f28" opacity="0.92" />
        <ellipse cx="395" cy="505" rx="36" ry="34" fill="#4a382f" opacity="0.95" />
        <ellipse cx="520" cy="522" rx="78" ry="48" fill="#352820" opacity="0.9" />
        <ellipse cx="565" cy="508" rx="32" ry="30" fill="#45352c" opacity="0.95" />
      </svg>
    </div>
  );
}

export function HeroSceneFrame({ children, size = 'modal' }: FrameProps) {
  const maxW = size === 'modal' ? 'max-w-[540px]' : 'max-w-[400px]';
  return (
    <div
      className={`relative mx-auto w-full ${maxW} overflow-hidden rounded-xl border-2 border-white shadow-[0_8px_28px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06]`}
    >
      <div className="relative aspect-[16/9] w-full bg-[#2d6478]">
        <HeroClassicSceneBackdrop />
        {children}
      </div>
    </div>
  );
}

/** Default Hero section preview — centered headline + ghost CTA (matches live runtime). */
export function HeroDefaultPreviewArt({ size = 'modal' }: { size?: 'modal' | 'compact' }) {
  const titleCls =
    size === 'modal'
      ? 'max-w-[20rem] text-[1.75rem] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]'
      : 'max-w-[12rem] text-[1.05rem] font-bold leading-tight tracking-tight text-white drop-shadow-sm';
  const btnCls =
    size === 'modal'
      ? 'mt-6 inline-flex rounded-full border border-white/90 bg-black/25 px-7 py-2.5 text-sm font-medium text-white'
      : 'mt-4 inline-flex rounded-full border border-white/90 bg-black/25 px-5 py-1.5 text-[0.65rem] font-medium text-white';

  return (
    <HeroSceneFrame size={size}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
        <h3 className={titleCls}>Browse our latest products</h3>
        <span className={btnCls}>Shop all</span>
      </div>
    </HeroSceneFrame>
  );
}
