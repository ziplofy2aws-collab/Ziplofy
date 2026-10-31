import React from 'react';

type ProductFormStageProps = {
  step: number;
  title: string;
  description?: string;
  optional?: boolean;
  children: React.ReactNode;
};

/** Numbered stage wrapper — guides merchants through a natural add-product story. */
export function ProductFormStage({
  step,
  title,
  description,
  optional = false,
  children,
}: ProductFormStageProps) {
  return (
    <section className="scroll-mt-24">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[12px] font-semibold tabular-nums text-white"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-[15px] font-semibold tracking-tight text-gray-900">
            {title}
            {optional ? (
              <span className="ml-2 text-[12px] font-normal text-gray-400">Optional</span>
            ) : null}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 sm:pl-10">{children}</div>
    </section>
  );
}

type ProductFormCollapsibleProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/** Collapsed-by-default block for advanced / rarely needed settings. */
export function ProductFormCollapsible({
  title,
  description,
  defaultOpen = false,
  children,
}: ProductFormCollapsibleProps) {
  return (
    <details
      className="group rounded-lg border border-gray-200/60 bg-white open:shadow-sm"
      defaultOpen={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          {description ? (
            <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-[12px] font-medium text-gray-400 group-open:hidden">
          Show
        </span>
        <span className="hidden shrink-0 text-[12px] font-medium text-gray-400 group-open:inline">
          Hide
        </span>
      </summary>
      <div className="border-t border-gray-100">{children}</div>
    </details>
  );
}
