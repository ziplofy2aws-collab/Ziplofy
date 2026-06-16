import {
  ArrowLeftIcon,
  GiftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import type { GiftCardProduct } from '../../contexts/gift-card-products.context';
import { useGiftCardProductForm } from '../../hooks/useGiftCardProductForm';
import ProductDescriptionInput from './ProductDescriptionInput';
import ProductImagesSection from './ProductImagesSection';
import ProductOrganizationSection from './ProductOrganizationSection';
import ProductSearchEngineListingSection from './ProductSearchEngineListingSection';

type GiftCardProductFormProps = {
  onBack?: () => void;
  onSuccess?: (product: GiftCardProduct) => void;
};

function GiftCardSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm ${className}`.trim()}
    >
      {children}
    </section>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';

export const GiftCardProductForm: React.FC<GiftCardProductFormProps> = ({
  onBack,
  onSuccess,
}) => {
  const {
    activeStoreId,
    activeStore,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    loading,
    selectedImages,
    addImageFiles,
    removeImage,
    denominations,
    setDenominations,
    redemptionScope,
    setRedemptionScope,
    themeTemplate,
    setThemeTemplate,
    giftCardTemplate,
    setGiftCardTemplate,
  } = useGiftCardProductForm({ onSuccess });

  const submitDisabled = loading || isSubmitting || !activeStoreId || !formData.title.trim();

  const handleDenominationChange = useCallback(
    (index: number, value: string) => {
      setDenominations((prev) => prev.map((item, i) => (i === index ? value : item)));
    },
    [setDenominations]
  );

  const handleAddDenomination = useCallback(() => {
    setDenominations((prev) => [...prev, '']);
  }, [setDenominations]);

  const handleRemoveDenomination = useCallback(
    (index: number) => {
      setDenominations((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    },
    [setDenominations]
  );

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Gift cards
          </button>
        ) : null}

        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
            <GiftIcon className="h-4 w-4 text-gray-700" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Create gift card product
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <GiftCardSection>
              <div className="space-y-5">
                <div>
                  <FieldLabel htmlFor="gift-card-title">Title</FieldLabel>
                  <input
                    id="gift-card-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={activeStore ? `${activeStore.storeName} gift card` : 'Gift card'}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <ProductDescriptionInput
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                  />
                </div>
              </div>
            </GiftCardSection>

            <GiftCardSection>
              <ProductImagesSection
                images={selectedImages.map((image) => image.previewUrl)}
                onAddImageFiles={addImageFiles}
                onRemoveImage={removeImage}
                disabled={isSubmitting || loading}
              />
            </GiftCardSection>

            <GiftCardSection>
              <FieldLabel htmlFor="gift-card-category">Category</FieldLabel>
              <select id="gift-card-category" className={selectClass} value="gift-cards" disabled>
                <option value="gift-cards">Gift cards</option>
              </select>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Determines tax rates and adds metafields to improve search, filters, and cross-channel
                sales.
              </p>
            </GiftCardSection>

            <GiftCardSection>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="gift-card-currency">Currency</FieldLabel>
                  <input
                    id="gift-card-currency"
                    readOnly
                    value="Store currency (INR ₹)"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="gift-card-redemption">Redemption in</FieldLabel>
                  <select
                    id="gift-card-redemption"
                    className={selectClass}
                    value={redemptionScope}
                    onChange={(e) => setRedemptionScope(e.target.value as 'all' | 'store')}
                  >
                    <option value="all">All currencies</option>
                    <option value="store">Store currency only</option>
                  </select>
                </div>
              </div>

              <p className="mt-4 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-xs leading-relaxed text-gray-600">
                Gift cards are issued in the store currency and can be redeemed in any currency.
                Exchange rates will be determined at checkout using your Market settings.
              </p>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <FieldLabel>Denominations</FieldLabel>
                <div className="space-y-3">
                  {denominations.map((denomination, index) => (
                    <div key={`denomination-${index}`} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={denomination}
                          onChange={(e) => handleDenominationChange(index, e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-200 py-2.5 pl-8 pr-3 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDenomination(index)}
                        disabled={denominations.length <= 1}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Remove denomination"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddDenomination}
                  className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
                >
                  Add denomination
                </button>
              </div>
            </GiftCardSection>

            <ProductSearchEngineListingSection
              productTitle={formData.title}
              productDescription={formData.description}
              pageTitle={formData.pageTitle}
              metaDescription={formData.metaDescription}
              urlHandle={formData.urlHandle}
              onPageTitleChange={(value) => handleInputChange('pageTitle', value)}
              onMetaDescriptionChange={(value) => handleInputChange('metaDescription', value)}
              onUrlHandleChange={(value) => handleInputChange('urlHandle', value)}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <GiftCardSection>
              <FieldLabel htmlFor="gift-card-status">Status</FieldLabel>
              <select
                id="gift-card-status"
                className={selectClass}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </GiftCardSection>

            <ProductOrganizationSection
              productType={formData.productType}
              vendor={formData.vendor}
              tags={formData.tags}
              onProductTypeChange={(productTypeId) => handleInputChange('productType', productTypeId)}
              onVendorChange={(vendorId) => handleInputChange('vendor', vendorId)}
              onTagsChange={(tags) => handleInputChange('tags', tags)}
              activeStoreId={activeStoreId}
            />

            <GiftCardSection>
              <FieldLabel htmlFor="gift-card-theme-template">Theme template</FieldLabel>
              <select
                id="gift-card-theme-template"
                className={selectClass}
                value={themeTemplate}
                onChange={(e) => setThemeTemplate(e.target.value)}
              >
                <option value="default-product">Default product</option>
              </select>
            </GiftCardSection>

            <GiftCardSection>
              <FieldLabel htmlFor="gift-card-template">Gift card template</FieldLabel>
              <select
                id="gift-card-template"
                className={selectClass}
                value={giftCardTemplate}
                onChange={(e) => setGiftCardTemplate(e.target.value)}
              >
                <option value="gift_card">gift_card</option>
              </select>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                This is what customers see when they redeem a gift card.
              </p>
            </GiftCardSection>
          </aside>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitDisabled}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || loading ? 'Saving gift card product...' : 'Save gift card product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftCardProductForm;
