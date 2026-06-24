import React from 'react';
import type { CheckoutFooterAlignment } from '../settings/checkout-settings.types';
import { CheckoutPolicyLinks } from '../policies/CheckoutPolicyLinks';

const ALIGNMENT_CLASS: Record<CheckoutFooterAlignment, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

type Props = {
  storeId?: string | null;
  alignment?: CheckoutFooterAlignment;
  device?: 'desktop' | 'mobile';
  highlightNodeId?: string | null;
  constrained?: boolean;
  onSelectNode?: (nodeId: string) => void;
};

export function CheckoutFooterRuntimePreview({
  storeId,
  alignment = 'left',
  device = 'desktop',
  highlightNodeId = null,
  constrained = true,
  onSelectNode,
}: Props) {
  const highlighted = highlightNodeId === 'checkout:footer';
  const isMobile = device === 'mobile';
  const linksDisabled = highlighted || !storeId;

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
        <CheckoutPolicyLinks
          storeId={storeId}
          device={device}
          disabled={linksDisabled}
          className={ALIGNMENT_CLASS[alignment]}
        />
      </div>
    </footer>
  );
}
