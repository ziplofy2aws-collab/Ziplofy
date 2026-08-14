import React from 'react';

const cardShell =
  'flex min-h-[280px] flex-col overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-5 sm:min-h-[300px] sm:p-6';

const ctaClass =
  'inline-flex w-fit items-center justify-center rounded-full border border-admin-border bg-admin-surface px-4 py-2 text-[13px] font-semibold text-admin-text transition-colors hover:bg-admin-row-hover';

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

function ProductIllustration() {
  return (
    <div className="relative flex h-[140px] w-full max-w-[260px] items-end justify-center gap-3">
      <div className="absolute inset-x-8 bottom-2 h-16 rounded-full bg-admin-secondary blur-md" aria-hidden />
      <div className="relative z-[1] h-24 w-20 rounded-t-[40%] border border-admin-border bg-[#f7f7f5] shadow-sm">
        <div className="absolute inset-x-3 top-4 h-10 rounded-md bg-white/80" />
        <div className="absolute inset-x-4 bottom-3 h-2 rounded-full bg-admin-fill" />
      </div>
      <div className="relative z-[2] mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-admin-border bg-admin-surface shadow-sm">
        <span className="text-xl font-light text-admin-text-subdued">+</span>
      </div>
      <div className="relative z-[1] h-20 w-16 rounded-lg border border-[#b7e4c7] bg-[#cdfee1]/70 shadow-sm">
        <div className="absolute inset-2 rounded-md border border-[#9ed4b0]/60 bg-white/40" />
      </div>
    </div>
  );
}

function ThemeIllustration() {
  return (
    <div className="relative h-[140px] w-full max-w-[280px]">
      <div className="absolute left-4 top-4 h-24 w-36 -rotate-6 rounded-lg border border-admin-border bg-[#eef2f7] shadow-sm" />
      <div className="absolute right-2 top-2 h-28 w-40 rotate-3 overflow-hidden rounded-lg border border-admin-border bg-admin-surface shadow-md">
        <div className="h-5 border-b border-admin-divider bg-admin-table-header" />
        <div className="space-y-2 p-3">
          <div className="h-2 w-3/4 rounded bg-admin-fill" />
          <div className="h-2 w-1/2 rounded bg-admin-secondary" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="aspect-square rounded bg-[#dbe7ff]" />
            <div className="aspect-square rounded bg-[#ffe8d6]" />
            <div className="aspect-square rounded bg-[#e3f1df]" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 z-[2] flex h-14 w-14 -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-xl border border-admin-border bg-admin-surface shadow-md">
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
      <div className="absolute left-2 top-4 h-14 w-14 -rotate-12 rounded-xl border border-admin-border bg-[#003087] shadow-md" />
      <div className="absolute right-6 top-2 z-[1] flex h-12 w-16 items-center justify-center rounded-lg border border-admin-border bg-[#1a1f71] shadow-md">
        <span className="text-[10px] font-bold tracking-wide text-white">CARD</span>
      </div>
      <div className="absolute bottom-3 left-1/2 z-[2] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-admin-border bg-admin-surface shadow-md">
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
      <div className="w-[168px] overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-md">
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
