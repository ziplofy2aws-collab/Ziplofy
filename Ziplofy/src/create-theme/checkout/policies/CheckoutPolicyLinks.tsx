import React from 'react';
import { CHECKOUT_POLICY_LINKS } from './checkout-policy-links.config';
import { CheckoutPolicyModal } from './CheckoutPolicyModal';
import { useCheckoutPolicyModal } from './useCheckoutPolicyModal';

type Props = {
  storeId?: string | null;
  accentColor?: string;
  device?: 'desktop' | 'mobile';
  disabled?: boolean;
  className?: string;
};

export function CheckoutPolicyLinks({
  storeId,
  accentColor = '#005bd3',
  device = 'desktop',
  disabled = false,
  className = '',
}: Props) {
  const { open, activeTitle, loading, error, content, openPolicy, closePolicy } =
    useCheckoutPolicyModal(storeId);

  const isMobile = device === 'mobile';
  const linkClass = `underline ${isMobile ? 'text-[13px]' : 'text-[14px]'} ${
    disabled || !storeId ? 'cursor-default' : 'cursor-pointer hover:opacity-90'
  }`;
  const linkStyle = { color: accentColor, textDecorationColor: accentColor };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className} ${isMobile ? 'gap-x-3 gap-y-1.5' : ''}`}>
        {CHECKOUT_POLICY_LINKS.map((link) => (
          <button
            key={link.type}
            type="button"
            className={`${linkClass} border-0 bg-transparent p-0 font-inherit`}
            style={linkStyle}
            disabled={disabled || !storeId}
            onClick={(e) => {
              e.stopPropagation();
              void openPolicy(link.type, link.modalTitle);
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <CheckoutPolicyModal
        open={open}
        title={activeTitle}
        loading={loading && !content}
        error={error}
        content={content}
        onClose={closePolicy}
      />
    </>
  );
}
