import React from 'react';

type Size = 'modal' | 'compact';

/** Flat figure (blue shirt) for layered slideshow preview. */
function LayeredSlideshowFigure({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ''}`} aria-hidden>
      <div className="absolute left-1/2 top-[4%] h-[20%] w-[36%] -translate-x-1/2 rounded-full bg-[#e8c4a8]" />
      <div className="absolute left-1/2 top-[17%] h-[22%] w-[50%] -translate-x-1/2 rounded-t-md bg-white" />
      <div className="absolute left-1/2 top-[23%] h-[77%] w-[94%] -translate-x-1/2 overflow-hidden rounded-t-[28%] bg-[#4a7fc4]">
        <div className="absolute left-[9%] top-0 h-full w-[13%] bg-[#3a6dad]" />
        <div className="absolute right-[9%] top-0 h-full w-[13%] bg-[#3a6dad]" />
      </div>
    </div>
  );
}

/** Scenic hills + water behind the figure (unified tan banner). */
function LayeredSlideshowScenery() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#ebe8df]" />
      <div
        className="absolute bottom-[22%] left-[30%] right-0 h-[38%] bg-[#d9cbb8]"
        style={{
          clipPath: 'polygon(0% 100%, 0% 45%, 22% 55%, 48% 35%, 72% 50%, 100% 30%, 100% 100%)',
        }}
      />
      <div
        className="absolute bottom-[14%] left-[38%] right-0 h-[28%] bg-[#c4b5a3]"
        style={{
          clipPath: 'polygon(0% 100%, 8% 60%, 35% 70%, 58% 48%, 82% 62%, 100% 42%, 100% 100%)',
        }}
      />
      <div className="absolute bottom-0 left-[34%] right-0 h-[32%] bg-[#4a9090]/75" />
      <div className="absolute bottom-[8%] right-[20%] h-[22%] w-[8%] rounded-full bg-[#5f9468]" />
      <div className="absolute bottom-[6%] right-[19%] h-[10%] w-[3%] bg-[#3d6b4a]" />
    </div>
  );
}

/** Right-edge peek of the next slide (landscape layer). */
function LayeredSlideshowPeekStrip() {
  return (
    <div
      className="absolute right-0 top-0 flex h-full w-[17%] overflow-hidden border-l border-white/50 shadow-[-4px_0_12px_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <div className="relative h-full w-full bg-gradient-to-b from-[#ebe6dc] via-[#e0d9ce] to-[#b8cdb0]">
        <div className="absolute left-1/2 top-[12%] h-7 w-7 -translate-x-1/2 rounded-full bg-white/95 shadow-sm" />
        <div
          className="absolute bottom-0 left-0 right-0 h-[55%] bg-[#5f9468]/90"
          style={{
            clipPath: 'polygon(0% 100%, 0% 55%, 35% 40%, 65% 60%, 100% 45%, 100% 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[38%] bg-[#4a7d56]/92"
          style={{
            clipPath: 'polygon(0% 100%, 20% 65%, 50% 75%, 80% 55%, 100% 70%, 100% 100%)',
          }}
        />
      </div>
    </div>
  );
}

/** Shopify-style layered slideshow add-section preview. */
export function LayeredSlideshowPreviewArt({ size = 'modal' }: { size?: Size }) {
  const outerMax = size === 'modal' ? 'max-w-[520px]' : 'max-w-[400px]';
  const minH = size === 'modal' ? 'min-h-[200px]' : 'min-h-[172px]';
  const figureH = size === 'modal' ? 'h-[160px]' : 'h-[148px]';
  const figureW = size === 'modal' ? 'w-[78%] max-w-[160px]' : 'w-[72%] max-w-[140px]';
  const titleCls =
    size === 'modal'
      ? 'text-[1.2rem] font-bold leading-tight tracking-tight text-gray-900'
      : 'text-[1.05rem] font-bold leading-tight tracking-tight text-gray-900';
  const bodyCls =
    size === 'modal'
      ? 'mt-2.5 text-[0.62rem] leading-snug text-gray-600'
      : 'mt-2 text-[0.54rem] leading-snug text-gray-600';
  const btnCls =
    size === 'modal'
      ? 'mt-4 inline-flex w-fit rounded-full bg-gray-900 px-4 py-2 text-[0.68rem] font-medium text-white'
      : 'mt-3 inline-flex w-fit rounded-full bg-gray-900 px-3.5 py-1.5 text-[0.62rem] font-medium text-white';
  const textCol = size === 'modal' ? 'w-[42%] px-5 py-6' : 'w-[44%] px-4 py-5';
  const figurePr = size === 'modal' ? 'pr-[15%]' : 'pr-[16%]';

  return (
    <div
      className={`relative mx-auto w-full ${outerMax} overflow-hidden rounded-sm border border-white bg-white p-2 shadow-[0_2px_14px_rgba(0,0,0,0.1)]`}
    >
      <div className={`relative flex ${minH} overflow-hidden rounded-sm bg-[#ebe8df]`}>
        <LayeredSlideshowScenery />
        <div className={`relative z-10 flex shrink-0 flex-col justify-center ${textCol}`}>
          <h3 className={titleCls}>New arrivals</h3>
          <p className={bodyCls}>
            Introducing our latest products, made especially for the season. Shop your favorites before
            they&apos;re gone!
          </p>
          <span className={btnCls}>Shop now</span>
        </div>
        <div className={`relative z-10 flex min-w-0 flex-1 items-end justify-center ${figurePr}`}>
          <LayeredSlideshowFigure className={`relative ${figureH} ${figureW}`} />
        </div>
        <LayeredSlideshowPeekStrip />
      </div>
    </div>
  );
}
