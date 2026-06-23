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
  device?: 'desktop' | 'mobile';
  highlightNodeId?: string | null;
  constrained?: boolean;
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutFooterRuntimePreview({
  alignment = 'left',
  device = 'desktop',
  highlightNodeId = null,
  constrained = true,
  onSelectNode,
}: Props) {
  const highlighted = highlightNodeId === 'checkout:footer';
  const isMobile = device === 'mobile';

  return (
    <footer
      className={`pointer-events-auto w-full select-none ${
        constrained
          ? `mx-auto max-w-[580px] ${isMobile ? 'px-4 pb-6' : 'px-6 pb-8 sm:px-8'}`
          : `${isMobile ? 'px-4 py-6' : 'px-6 py-8 sm:px-8'}`
      } ${onSelectNode ? 'cursor-pointer' : ''} ${
        highlighted ? 'ring-2 ring-inset ring-[#005bd3]' : ''
      }`}
      data-checkout-node-id="checkout:footer"
      data-checkout-selectable={onSelectNode ? 'true' : undefined}
      onClick={(e) => {
        onSelectNode?.('checkout:footer');
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (!onSelectNode) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectNode('checkout:footer');
        }
      }}
      role={onSelectNode ? 'button' : undefined}
      tabIndex={onSelectNode ? 0 : undefined}
    >
      <div className={`border-t border-[#dedede] pt-4 ${highlighted ? 'pointer-events-none' : ''}`}>
        <div
          className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${ALIGNMENT_CLASS[alignment]} ${
            isMobile ? 'gap-x-3 gap-y-1.5' : ''
          }`}
        >
          {POLICY_LINKS.map((label) => (
            <span
              key={label}
              className={`text-[#1773b0] underline decoration-[#1773b0] ${
                isMobile ? 'text-[13px]' : 'text-[14px]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
