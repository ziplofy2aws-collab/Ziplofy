import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInformationSection from '../components/customer/BasicInformationSection';
import CustomerNotesSection from '../components/customer/CustomerNotesSection';
import CustomerTagsSection from '../components/customer/CustomerTagsSection';
import MarketingPreferencesSection from '../components/customer/MarketingPreferencesSection';
import TaxSettingsSection from '../components/customer/TaxSettingsSection';
import CustomerFormHeader from '../components/customers/CustomerFormHeader';
import { useCustomerTags } from '../contexts/customer-tags.context';
import type { CreateCustomerRequest } from '../contexts/customer.context';
import { useCustomers } from '../contexts/customer.context';
import { useStore } from '../contexts/store.context';

const NewCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addCustomer, loading, error } = useCustomers();
  const { activeStoreId } = useStore();
  const { customerTags, fetchCustomerTags, addCustomerTag } = useCustomerTags();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    language: 'en',
    agreedToMarketingEmails: false,
    agreedToSmsMarketing: false,
    taxSettings: {
      collectTax: 'collect',
    },
    notes: '',
    tags: '',
  });

  const handleInputChange = useCallback((field: string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeStoreId) return;

    const payload: CreateCustomerRequest = {
      storeId: activeStoreId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      language: formData.language,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      agreedToMarketingEmails: formData.agreedToMarketingEmails,
      agreedToSmsMarketing: formData.agreedToSmsMarketing,
      collectTax: formData.taxSettings.collectTax as 'collect' | 'dont_collect' | 'collect_unless_exempt',
      notes: formData.notes,
      tagIds: selectedTagIds,
    };

    const created = await addCustomer(payload);
    navigate(`/customers/${created._id}`, { state: { customerJustCreated: true } });
  }, [activeStoreId, formData, selectedTagIds, addCustomer, navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await handleSave();
      } catch (err) {
        console.error('Error creating customer:', err);
      }
    },
    [handleSave]
  );

  const handleCancel = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  const handleTagSelect = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  }, []);

  const handleCreateTag = useCallback(
    async (name: string) => {
      if (!activeStoreId || !name.trim()) return;

      try {
        const created = await addCustomerTag(activeStoreId, name);
        setSelectedTagIds((prev) => [...new Set([...prev, created._id])]);
      } catch (err) {
        console.error('Error creating tag:', err);
        throw err;
      }
    },
    [activeStoreId, addCustomerTag]
  );

  const handleRemoveTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  useEffect(() => {
    if (activeStoreId) fetchCustomerTags(activeStoreId);
  }, [activeStoreId, fetchCustomerTags]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[900px] px-3 py-4 sm:px-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <CustomerFormHeader
            mode="create"
            title="Add customer"
            onBack={handleCancel}
            onCancel={handleCancel}
            onSubmit={() => void handleSave()}
            submitLabel={loading ? 'Saving…' : 'Save customer'}
            submitDisabled={loading}
          />

          <BasicInformationSection
            data={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              language: formData.language,
            }}
            onChange={handleInputChange}
          />
          <MarketingPreferencesSection
            data={{
              agreedToMarketingEmails: formData.agreedToMarketingEmails,
              agreedToSmsMarketing: formData.agreedToSmsMarketing,
            }}
            onChange={handleInputChange}
          />
          <TaxSettingsSection
            data={{
              collectTax: formData.taxSettings.collectTax as
                | 'collect'
                | 'dont_collect'
                | 'collect_unless_exempt',
            }}
            onChange={handleInputChange}
          />
          <CustomerNotesSection
            notes={formData.notes}
            onChange={(notes) => handleInputChange('notes', notes)}
          />
          <CustomerTagsSection
            selectedTagIds={selectedTagIds}
            customerTags={customerTags}
            onTagSelect={handleTagSelect}
            onTagRemove={handleRemoveTag}
            onCreateTag={handleCreateTag}
            activeStoreId={activeStoreId || undefined}
          />

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default NewCustomerPage;
