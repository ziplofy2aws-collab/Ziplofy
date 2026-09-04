import React from 'react';

/**
 * Tailwind v4 animates transforms through the standalone `translate` / `rotate` /
 * `scale` properties, so these use `transition-all` rather than a property list.
 */
const easeOutExpo = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

const cardShell = [
  'group relative flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-5 sm:min-h-[300px] sm:p-6',
  `transition-all duration-500 ${easeOutExpo} will-change-transform`,
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]',
  'hover:-translate-y-2.5 hover:scale-[1.015]',
  'hover:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08),0_28px_56px_-18px_rgba(0,0,0,0.32)]',
  'focus-within:-translate-y-2.5 focus-within:scale-[1.015]',
  'focus-within:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.08),0_28px_56px_-18px_rgba(0,0,0,0.32)]',
  'motion-reduce:transform-none motion-reduce:transition-none',
].join(' ');

/** Soft light wash that fades in behind the illustration as the card lifts. */
const cardGlowClass = `pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ${easeOutExpo} group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none`;

const cardGlowStyle: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 90% at 50% 115%, rgba(0,91,211,0.10) 0%, rgba(0,91,211,0.03) 45%, transparent 72%)',
};

const ctaClass =
  'inline-flex w-fit items-center justify-center rounded-full border border-admin-border bg-admin-surface px-4 py-2 text-[13px] font-semibold text-admin-text shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-admin-row-hover group-hover:shadow-[0_4px_10px_-4px_rgba(0,0,0,0.2)]';

/** Illustration pieces animate together when the card is hovered or focused. */
const artBase = `transition-all duration-500 ${easeOutExpo} motion-reduce:transform-none motion-reduce:transition-none`;

/** Left-hand prop drifts further left as the card lifts. */
const artSpreadLeft = `${artBase} group-hover:-translate-x-5 group-hover:-translate-y-1 group-hover:rotate-[-8deg] group-hover:scale-105 group-focus-within:-translate-x-5 group-focus-within:-translate-y-1 group-focus-within:rotate-[-8deg] group-focus-within:scale-105`;

/** Right-hand prop drifts further right as the card lifts. */
const artSpreadRight = `${artBase} group-hover:translate-x-5 group-hover:-translate-y-1 group-hover:rotate-[8deg] group-hover:scale-105 group-focus-within:translate-x-5 group-focus-within:-translate-y-1 group-focus-within:rotate-[8deg] group-focus-within:scale-105`;

/** Centre piece rises above the props it sits between. */
const artLiftCenter = `${artBase} group-hover:-translate-y-3 group-hover:scale-110 group-focus-within:-translate-y-3 group-focus-within:scale-110`;

type SetupCardProps = {
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
  illustration: React.ReactNode;
  done?: boolean;
  className?: string;
};

function SetupCard({
  title,
  description,
  ctaLabel,
  onClick,
  illustration,
  done = false,
  className = '',
}: SetupCardProps) {
  return (
    <div className={`${cardShell} ${className}`.trim()}>
      <div className={cardGlowClass} style={cardGlowStyle} aria-hidden />

      <div className="relative z-[1] min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight text-admin-text sm:text-lg">{title}</h3>
          {done ? (
            <span className="shrink-0 rounded-full bg-[#cdfee1] px-2 py-0.5 text-[11px] font-semibold text-[#0d6b38]">
              Done
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 max-w-[34ch] text-[13px] leading-5 text-admin-text-secondary">{description}</p>
      </div>

      <div className="relative my-4 flex min-h-[120px] flex-1 items-center justify-center sm:min-h-[140px]">
        {illustration}
      </div>

      <div className="relative z-[1] mt-auto">
        <button type="button" onClick={onClick} className={ctaClass}>
          {done ? 'View' : ctaLabel}
        </button>
      </div>
    </div>
  );
}

function TShirtArt() {
  return (
    <svg viewBox="0 0 96 96" className="h-[104px] w-[104px] drop-shadow-sm" aria-hidden>
      <path
        d="M36 13 L19 21 C17 22 16.2 24.3 17 26.3 L22.6 40.4 C23.2 41.9 25 42.5 26.3 41.6 L31 38.4 V81 C31 82.7 32.3 84 34 84 H62 C63.7 84 65 82.7 65 81 V38.4 L69.7 41.6 C71 42.5 72.8 41.9 73.4 40.4 L79 26.3 C79.8 24.3 79 22 77 21 L60 13 C56.5 19.5 39.5 19.5 36 13 Z"
        fill="#faf8f4"
        stroke="#d8d5cd"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M37.5 14.5 C41 21 55 21 58.5 14.5" fill="none" stroke="#d8d5cd" strokeWidth="2" strokeLinecap="round" />
      <path d="M39 50 C42.5 44.5 53.5 44.5 57 50" fill="none" stroke="#1f8a4c" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="41" y="55" width="14" height="3.4" rx="1.7" fill="#1f8a4c" opacity="0.75" />
    </svg>
  );
}

function JeansArt() {
  return (
    <svg viewBox="0 0 72 104" className="h-[104px] w-[76px] drop-shadow-sm" aria-hidden>
      <path
        d="M11 12 H61 C61 12 60 18 59.5 24 L56 96 C55.9 98.2 54.2 100 52 100 H43 C40.9 100 39.2 98.4 39 96.3 L36 58 L33 96.3 C32.8 98.4 31.1 100 29 100 H20 C17.8 100 16.1 98.2 16 96 L12.5 24 C12 18 11 12 11 12 Z"
        fill="#c3d5ee"
        stroke="#8ea9ce"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M11.6 21 H60.4" stroke="#8ea9ce" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 22 V40" stroke="#8ea9ce" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 26 C21 28.5 25 29 28.5 26.5" fill="none" stroke="#8ea9ce" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M43.5 26.5 C47 29 51 28.5 55 26" fill="none" stroke="#8ea9ce" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="36" cy="17" r="2.2" fill="#8ea9ce" />
    </svg>
  );
}

function ProductIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[280px] items-end justify-center gap-1">
      <div
        className={`absolute inset-x-6 bottom-3 h-14 rounded-[50%] bg-admin-secondary blur-md ${artBase} group-hover:scale-x-125 group-hover:opacity-70 group-focus-within:scale-x-125 group-focus-within:opacity-70`}
        aria-hidden
      />
      <div className={`relative z-[1] ${artSpreadLeft}`}>
        <TShirtArt />
      </div>
      <div
        className={`relative z-[2] mb-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-admin-border bg-admin-surface shadow-sm ${artLiftCenter} group-hover:border-solid group-hover:border-admin-text-subdued group-hover:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)] group-focus-within:border-solid group-focus-within:border-admin-text-subdued group-focus-within:shadow-[0_10px_22px_-10px_rgba(0,0,0,0.35)]`}
      >
        <span className={`text-xl font-light text-admin-text-subdued ${artBase} group-hover:rotate-90 group-hover:text-admin-text group-focus-within:rotate-90 group-focus-within:text-admin-text`}>
          +
        </span>
      </div>
      <div className={`relative z-[1] ${artSpreadRight}`}>
        <JeansArt />
      </div>
    </div>
  );
}

function ThemeIllustration() {
  return (
    <div className="relative h-[140px] w-full max-w-[280px]">
      {/* Back template: minimal light theme */}
      <div className={`absolute left-3 top-4 h-24 w-36 -rotate-6 overflow-hidden rounded-lg border border-admin-border bg-admin-surface shadow-sm ${artBase} group-hover:-translate-x-3 group-hover:-rotate-12 group-focus-within:-translate-x-3 group-focus-within:-rotate-12`}>
        <div className="flex items-center gap-1 border-b border-admin-divider bg-[#f6f7f9] px-1.5 py-1">
          <span className="h-1 w-1 rounded-full bg-admin-text-subdued/60" />
          <span className="h-1 w-1 rounded-full bg-admin-text-subdued/40" />
          <span className="h-1 w-1 rounded-full bg-admin-text-subdued/25" />
          <span className="ml-auto h-1 w-6 rounded-full bg-admin-fill" />
        </div>
        <div className="space-y-1 p-2">
          <div className="h-6 rounded bg-gradient-to-br from-[#e6edf7] to-[#dbe7ff]" />
          <div className="h-1 w-4/5 rounded-full bg-admin-fill" />
          <div className="h-1 w-3/5 rounded-full bg-admin-secondary" />
          <div className="flex gap-1 pt-0.5">
            <div className="h-4 flex-1 rounded bg-[#eef2f7]" />
            <div className="h-4 flex-1 rounded bg-[#f3f0ea]" />
            <div className="h-4 flex-1 rounded bg-[#eaf3ec]" />
          </div>
        </div>
      </div>

      {/* Front template: richer storefront with nav, hero and product grid */}
      <div className={`absolute right-2 top-2 h-28 w-40 rotate-3 overflow-hidden rounded-lg border border-admin-border bg-admin-surface shadow-md ${artBase} group-hover:translate-x-3 group-hover:rotate-6 group-focus-within:translate-x-3 group-focus-within:rotate-6`}>
        <div className="flex items-center gap-1 border-b border-admin-divider bg-admin-table-header px-2 py-1.5">
          <span className="h-2 w-2 rounded-sm bg-admin-text" />
          <span className="h-1 w-4 rounded-full bg-admin-text-subdued/50" />
          <span className="h-1 w-3 rounded-full bg-admin-text-subdued/40" />
          <span className="h-1 w-3 rounded-full bg-admin-text-subdued/30" />
          <span className="ml-auto h-2 w-2 rounded-full border border-admin-border" />
        </div>
        <div className="relative h-8 bg-gradient-to-br from-[#d7e4ff] via-[#eaf0ff] to-[#ffe8d6]">
          <div className="absolute bottom-1.5 left-2 space-y-1">
            <div className="h-1.5 w-16 rounded-full bg-white/85" />
            <div className="h-1 w-10 rounded-full bg-white/65" />
          </div>
          <div className="absolute bottom-1.5 right-2 h-3 w-8 rounded-full bg-admin-text" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-2">
          <div className="space-y-1">
            <div className="aspect-square rounded bg-[#dbe7ff]" />
            <div className="h-1 w-full rounded-full bg-admin-fill" />
            <div className="h-1 w-2/3 rounded-full bg-admin-secondary" />
          </div>
          <div className="space-y-1">
            <div className="aspect-square rounded bg-[#ffe8d6]" />
            <div className="h-1 w-full rounded-full bg-admin-fill" />
            <div className="h-1 w-2/3 rounded-full bg-admin-secondary" />
          </div>
          <div className="space-y-1">
            <div className="aspect-square rounded bg-[#e3f1df]" />
            <div className="h-1 w-full rounded-full bg-admin-fill" />
            <div className="h-1 w-2/3 rounded-full bg-admin-secondary" />
          </div>
        </div>
      </div>
      <div className={`absolute bottom-3 left-1/2 z-[2] flex h-14 w-14 -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-xl border border-admin-border bg-admin-surface shadow-md ${artLiftCenter}`}>
        <div className="flex gap-0.5">
          <span className="h-2 w-2 rounded-sm bg-admin-text-subdued" />
          <span className="h-2 w-2 rounded-sm bg-admin-text-subdued" />
          <span className="h-2 w-2 rounded-sm bg-admin-text-subdued" />
        </div>
        <div className="rounded bg-admin-text px-1.5 py-0.5 text-[9px] font-semibold text-white">Aa</div>
      </div>
    </div>
  );
}

function PaymentsIllustration() {
  return (
    <div className="relative flex h-[120px] w-full max-w-[220px] items-center justify-center">
      <div className={`absolute left-2 top-4 h-14 w-14 -rotate-12 rounded-xl border border-admin-border bg-[#003087] shadow-md ${artBase} group-hover:-translate-x-3 group-hover:rotate-[-18deg] group-focus-within:-translate-x-3 group-focus-within:rotate-[-18deg]`} />
      <div className={`absolute right-6 top-2 z-[1] flex h-12 w-16 items-center justify-center rounded-lg border border-admin-border bg-[#1a1f71] shadow-md ${artBase} group-hover:translate-x-3 group-hover:rotate-6 group-focus-within:translate-x-3 group-focus-within:rotate-6`}>
        <span className="text-[10px] font-bold tracking-wide text-white">CARD</span>
      </div>
      <div className={`absolute bottom-3 left-1/2 z-[2] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-admin-border bg-admin-surface shadow-md ${artLiftCenter}`}>
        <div className="flex -space-x-1.5">
          <span className="h-5 w-5 rounded-full bg-[#eb001b]" />
          <span className="h-5 w-5 rounded-full bg-[#f79e1b]" />
        </div>
      </div>
    </div>
  );
}

function NameTagIllustration() {
  return (
    <div className="relative flex h-[130px] w-full max-w-[200px] items-center justify-center">
      <div className={`w-[168px] overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-md ${artBase} group-hover:-translate-y-1.5 group-hover:rotate-2 group-hover:scale-105 group-focus-within:-translate-y-1.5 group-focus-within:rotate-2 group-focus-within:scale-105`}>
        <div className="bg-[#c62828] px-3 py-2 text-center">
          <p className="text-[8px] font-bold tracking-[0.2em] text-white">HELLO</p>
          <p className="text-[7px] font-medium tracking-wide text-white/90">my name is</p>
        </div>
        <div
          className="h-14"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #f8f1e8 0%, #e8f4ff 35%, #fff4d6 65%, #e8ffe8 100%)',
          }}
        />
      </div>
    </div>
  );
}

export type DashboardEmptySetupGuideProps = {
  onAddProduct: () => void;
  onChooseTheme: () => void;
  onSetupPayments: () => void;
  onNameStore: () => void;
  hasProduct?: boolean;
  hasChosenTheme?: boolean;
  hasPaymentMethod?: boolean;
  hasCustomStoreName?: boolean;
};

export default function DashboardEmptySetupGuide({
  onAddProduct,
  onChooseTheme,
  onSetupPayments,
  onNameStore,
  hasProduct = false,
  hasChosenTheme = false,
  hasPaymentMethod = false,
  hasCustomStoreName = false,
}: DashboardEmptySetupGuideProps) {
  return (
    <section aria-label="Store setup guide" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SetupCard
          title="Add your first product"
          description="Start with a title, price, and a photo. You can always add more detail later."
          ctaLabel="Add product"
          onClick={onAddProduct}
          illustration={<ProductIllustration />}
          done={hasProduct}
        />
        <SetupCard
          title="Choose your store design"
          description="Pick a theme that fits your brand, then customize from there."
          ctaLabel="Choose theme"
          onClick={onChooseTheme}
          illustration={<ThemeIllustration />}
          done={hasChosenTheme}
        />
        <SetupCard
          title="Set up payments"
          description="Choose a payment provider to let customers pay by card or digital wallet."
          ctaLabel="Activate payments"
          onClick={onSetupPayments}
          illustration={<PaymentsIllustration />}
          done={hasPaymentMethod}
        />
        <SetupCard
          title="Name your store"
          description="Customers will see this across your storefront, emails, and checkout."
          ctaLabel="Add name"
          onClick={onNameStore}
          illustration={<NameTagIllustration />}
          done={hasCustomStoreName}
        />
      </div>
    </section>
  );
}
