import React from 'react';

type Props = {
  /** Large art for add-section modal; compact for catalog thumbnails. */
  size?: 'modal' | 'compact';
};

/** Shopify-style footer section preview (email list + signup). */
export function FooterSectionPreviewArt({ size = 'modal' }: Props) {
  if (size === 'compact') {
    return (
      <div className="flex w-full items-center gap-4 rounded-lg border border-[#e1e1e1] bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.7rem] font-bold leading-tight text-gray-900">Join our email list</h3>
          <p className="mt-0.5 max-w-[9rem] text-[0.5rem] leading-snug text-gray-600">
            Get exclusive deals and early access to new products.
          </p>
        </div>
        <div className="flex w-[48%] max-w-[140px] shrink-0 items-center gap-1.5">
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#c9cccf] bg-white px-2.5 py-1.5">
            <span className="truncate text-[0.45rem] text-gray-400">Email address</span>
          </div>
          <span className="shrink-0 rounded-full bg-gray-900 px-2.5 py-1.5 text-[0.45rem] font-medium text-white">
            Sign up
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[540px] px-4">
      <div className="flex items-center gap-6 overflow-hidden rounded-xl border border-[#e1e1e1] bg-white px-8 py-6 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-gray-900">Join our email list</h3>
          <p className="mt-2 max-w-[16rem] text-sm leading-snug text-gray-600">
            Get exclusive deals and early access to new products.
          </p>
        </div>
        <div className="flex w-[min(52%,260px)] shrink-0 items-center gap-2.5">
          <div className="flex min-h-[44px] min-w-0 flex-1 items-center rounded-full border border-[#c9cccf] bg-white px-4">
            <span className="truncate text-sm text-gray-400">Email address</span>
          </div>
          <span className="flex shrink-0 items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white">
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}
