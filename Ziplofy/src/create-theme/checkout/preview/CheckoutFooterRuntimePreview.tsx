import React from 'react';
import type { CheckoutFooterAlignment } from '../settings/checkout-settings.types';

const POLICY_LINKS = [
  'Refund policy',
  'Shipping',
  'Privacy policy',
  'Terms of service',
  'Legal notice',
] as const;

const ALIGNMENT_CLASS: Record<CheckoutFooterAlignment, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

type Props = {
  alignment?: CheckoutFooterAlignment;
  highlightNodeId?: string | null;
  constrained?: boolean;
};

export function CheckoutFooterRuntimePreview({
  alignment = 'left',
  highlightNodeId = null,
  constrained = true,
}: Props) {
  const highlighted = highlightNodeId === 'checkout:footer';

  return (
    <footer
      className={`pointer-events-none w-full select-none ${
        constrained ? 'mx-auto max-w-[580px] px-6 pb-8 sm:px-8' : 'px-6 py-8 sm:px-8'
      } ${highlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''}`}
    >
      <div className="border-t border-[#dedede] pt-4">
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${ALIGNMENT_CLASS[alignment]}`}>
          {POLICY_LINKS.map((label) => (
            <span key={label} className="text-[14px] text-[#1773b0] underline decoration-[#1773b0]">
              {label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
