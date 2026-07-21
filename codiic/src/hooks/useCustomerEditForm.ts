import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Customer, UpdateCustomerRequest } from '../contexts/customer.context';
import { useCustomers } from '../contexts/customer.context';

type CustomerFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  language: string;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  taxSettings: {
    collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  };
  notes: string;
};

function customerToFormState(customer: Customer): CustomerFormState {
  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    language: customer.language,
    agreedToMarketingEmails: customer.agreedToMarketingEmails,
    agreedToSmsMarketing: customer.agreedToSmsMarketing,
    taxSettings: {
      collectTax: customer.collectTax,
    },
    notes: customer.notes ?? '',
  };
}

function tagIdsFromCustomer(customer: Customer): string[] {
  if (!Array.isArray(customer.tagIds)) return [];
  return customer.tagIds.map((tag) => (typeof tag === 'string' ? tag : tag._id));
}

export function useCustomerEditForm(customer: Customer | null, customerId: string | undefined) {
  const { updateCustomer, loading, error, clearError } = useCustomers();
  const [formData, setFormData] = useState<CustomerFormState | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');

  useEffect(() => {
    if (!customer) return;
    const nextForm = customerToFormState(customer);
    const nextTagIds = tagIdsFromCustomer(customer);
    setFormData(nextForm);
    setSelectedTagIds(nextTagIds);
    setInitialSnapshot(
      JSON.stringify({
        form: nextForm,
        tagIds: nextTagIds,
      })
    );
  }, [customer]);

  const handleInputChange = useCallback((field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof CustomerFormState] as Record<string, unknown>),
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  }, []);

  const isDirty = useMemo(() => {
    if (!formData || !initialSnapshot) return false;
    return (
      JSON.stringify({ form: formData, tagIds: selectedTagIds }) !== initialSnapshot
    );
  }, [formData, selectedTagIds, initialSnapshot]);

  const handleSave = useCallback(async () => {
    if (!customerId || !formData) return null;

    clearError();

    const payload: UpdateCustomerRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      language: formData.language,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      agreedToMarketingEmails: formData.agreedToMarketingEmails,
      agreedToSmsMarketing: formData.agreedToSmsMarketing,
      collectTax: formData.taxSettings.collectTax,
      notes: formData.notes,
      tagIds: selectedTagIds,
    };

    const updated = await updateCustomer(customerId, payload);
    const nextForm = customerToFormState(updated);
    const nextTagIds = tagIdsFromCustomer(updated);
    setFormData(nextForm);
    setSelectedTagIds(nextTagIds);
    setInitialSnapshot(JSON.stringify({ form: nextForm, tagIds: nextTagIds }));
    return updated;
  }, [customerId, formData, selectedTagIds, updateCustomer, clearError]);

  return {
    formData,
    selectedTagIds,
    setSelectedTagIds,
    handleInputChange,
    handleSave,
    isDirty,
    loading,
    error,
  };
}
