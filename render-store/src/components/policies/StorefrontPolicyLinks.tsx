import { useCallback, useState } from 'react';
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
};

export function StorefrontPolicyLinks({
  storeId: storeIdProp,
  device = 'desktop',
  disabled = false,
  className = '',
  linkClassName,
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
      await fetchPolicyByType(storeId, type);
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
    `text-[#1773b0] underline decoration-[#1773b0] ${
      isMobile ? 'text-[13px]' : 'text-[14px]'
    } ${disabled || !storeId ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}`;

  const modalContent = activeType ? getPolicyByType(activeType)?.content ?? null : null;

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className} ${isMobile ? 'gap-x-3 gap-y-1.5' : ''}`}>
        {STOREFRONT_POLICY_LINKS.map((link) => (
          <button
            key={link.type}
            type="button"
            className={`${linkClass} border-0 bg-transparent p-0 font-inherit`}
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
