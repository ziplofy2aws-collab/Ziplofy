import { useCallback, useState } from 'react';
import type { CheckoutStorePolicyType } from './useCheckoutStorePolicies';
import { useCheckoutStorePolicies } from './useCheckoutStorePolicies';

export function useCheckoutPolicyModal(storeId: string | null | undefined) {
  const { loading, error, ensurePolicyByType, getPolicyContent, policies, clearError } =
    useCheckoutStorePolicies(storeId);
  const [open, setOpen] = useState(false);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeType, setActiveType] = useState<CheckoutStorePolicyType | null>(null);

  const openPolicy = useCallback(
    async (type: CheckoutStorePolicyType, title: string) => {
      if (!storeId) return;
      setActiveType(type);
      setActiveTitle(title);
      setOpen(true);
      clearError();
      await ensurePolicyByType(type);
    },
    [storeId, ensurePolicyByType, clearError]
  );

  const closePolicy = useCallback(() => {
    setOpen(false);
    setActiveType(null);
    setActiveTitle('');
    clearError();
  }, [clearError]);

  const content = activeType ? getPolicyContent(activeType) : null;

  return {
    open,
    activeTitle,
    loading,
    error,
    content,
    policies,
    openPolicy,
    closePolicy,
  };
}
