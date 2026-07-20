import { useCallback, useState, type CSSProperties } from 'react';
import { useStorefront } from '@/contexts/store.context';
import { useStorefrontPolicies, type StorefrontPolicyType } from '@/contexts/storefront-policies.context';
import { STOREFRONT_POLICY_LINKS } from './storefront-policy-links.config';
import { StorefrontPolicyModal } from './StorefrontPolicyModal';

type Props = {
  storeId?: string | null;
  device?: 'desktop' | 'mobile';
  disabled?: boolean;
  className?: string;
  linkClassName?: string;
  /** Inline styles applied to each policy link button (theme footer typography). */
  linkStyle?: CSSProperties;
};

export function StorefrontPolicyLinks({
  storeId: storeIdProp,
  device = 'desktop',
  disabled = false,
  className = '',
  linkClassName,
  linkStyle,
}: Props) {
  const { storeFrontMeta } = useStorefront();
  const storeId = storeIdProp ?? storeFrontMeta?.storeId ?? null;
  const { loading, error, fetchPolicyByType, getPolicyByType } = useStorefrontPolicies();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeType, setActiveType] = useState<StorefrontPolicyType | null>(null);

  const handleOpen = useCallback(
    async (type: StorefrontPolicyType, title: string) => {
      if (disabled || !storeId) return;
      setActiveType(type);
      setActiveTitle(title);
      setModalOpen(true);
      try {
        await fetchPolicyByType(storeId, type);
      } catch {
        /* error surfaced via context */
      }
    },
    [disabled, storeId, fetchPolicyByType]
  );

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setActiveType(null);
    setActiveTitle('');
  }, []);

  const isMobile = device === 'mobile';
  const linkClass =
    linkClassName ??
    (linkStyle
      ? `border-0 bg-transparent p-0 font-inherit underline ${
          disabled || !storeId ? 'cursor-default' : 'cursor-pointer hover:opacity-90'
        }`
      : `text-[#1773b0] underline decoration-[#1773b0] ${
          isMobile ? 'text-[13px]' : 'text-[14px]'
        } ${disabled || !storeId ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}`);

  const modalContent = activeType ? getPolicyByType(activeType)?.content ?? null : null;

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className} ${isMobile ? 'gap-x-3 gap-y-1.5' : ''}`}
        style={linkStyle ? { gap: isMobile ? '6px 12px' : '8px 20px' } : undefined}
      >
        {STOREFRONT_POLICY_LINKS.map((link) => (
          <button
            key={link.type}
            type="button"
            className={`${linkClass} border-0 bg-transparent p-0 font-inherit`}
            style={linkStyle}
            disabled={disabled || !storeId}
            onClick={(e) => {
              e.stopPropagation();
              void handleOpen(link.type, link.modalTitle);
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      <StorefrontPolicyModal
        open={modalOpen}
        title={activeTitle}
        loading={loading && !modalContent}
        error={error}
        content={modalContent}
        onClose={handleClose}
      />
    </>
  );
}
