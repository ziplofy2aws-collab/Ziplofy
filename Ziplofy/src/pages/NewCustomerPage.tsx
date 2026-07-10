import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInformationSection from '../components/customer/BasicInformationSection';
import CustomerNotesSection from '../components/customer/CustomerNotesSection';
import CustomerTagsSection from '../components/customer/CustomerTagsSection';
import MarketingPreferencesSection from '../components/customer/MarketingPreferencesSection';
import TaxSettingsSection from '../components/customer/TaxSettingsSection';
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
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    language: 'en',
    
    // Marketing Preferences
    agreedToMarketingEmails: false,
    agreedToSmsMarketing: false,
    
    // Tax Settings
    taxSettings: {
      collectTax: 'collect',
    },
     
    // Additional Information
    notes: '',
    tags: '',
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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

      await addCustomer(payload);
      
      // Navigate back to customers list on success
      navigate('/customers');
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  }, [activeStoreId, formData, selectedTagIds, addCustomer, navigate]);

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

  // Load tags for active store
  useEffect(() => {
    if (activeStoreId) fetchCustomerTags(activeStoreId);
  }, [activeStoreId, fetchCustomerTags]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to customers
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Customer</h1>
          <p className="text-sm text-gray-600 mt-1">Create a new customer for your store</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
                collectTax: formData.taxSettings.collectTax as 'collect' | 'dont_collect' | 'collect_unless_exempt',
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white inline mr-1.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Customer...
                  </>
                ) : (
                  'Save Customer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerPage;
