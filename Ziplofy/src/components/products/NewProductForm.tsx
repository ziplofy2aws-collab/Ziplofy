import {
  ArrowLeftIcon,
  CubeIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import type { Product } from '../../contexts/product.context';
import { useNewProductForm } from '../../hooks/useNewProductForm';
import ProductBasicInformationSection from './ProductBasicInformationSection';
import ProductInventorySection from './ProductInventorySection';
import ProductOrganizationSection from './ProductOrganizationSection';
import ProductPriceSection from './ProductPriceSection';
import ProductSearchEngineListingSection from './ProductSearchEngineListingSection';
import ProductShippingSection from './ProductShippingSection';
import ProductStatusSection from './ProductStatusSection';

export type NewProductFormProps = {
  variant?: 'page' | 'sheet';
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  onBack?: () => void;
};

export const NewProductForm: React.FC<NewProductFormProps> = ({
  variant = 'page',
  onSuccess,
  onCancel,
  onBack,
}) => {
  const {
    activeStoreId,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    productLoading,
    selectedImages,
    addImageFiles,
    removeImage,
    addVariant,
    removeVariant,
    updateVariantOptionName,
    addVariantValue,
    removeVariantValue,
    updateVariantValue,
  } = useNewProductForm({
    onSuccess,
    navigateOnSuccess: variant === 'page',
  });

  const isSheet = variant === 'sheet';
  const submitDisabled = productLoading || isSubmitting || !activeStoreId;

  return (
    <div className={isSheet ? 'bg-page-background-color' : 'min-h-screen bg-page-background-color'}>
      <div className={isSheet ? 'px-4 py-4 sm:px-6' : 'mx-auto max-w-[1500px] px-3 py-4 sm:px-4'}>
        <div className={isSheet ? 'mb-4' : 'mb-5'}>
          {!isSheet && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Products
            </button>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                <CubeIcon className="h-4 w-4 text-gray-700" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Add product
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isSheet && onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting || productLoading ? 'Creating product...' : 'Add product'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <ProductBasicInformationSection
              title={formData.title}
              description={formData.description}
              category={formData.category}
              activeStoreId={activeStoreId}
              images={selectedImages.map((image) => image.previewUrl)}
              onTitleChange={(value) => handleInputChange('title', value)}
              onDescriptionChange={(value) => handleInputChange('description', value)}
              onCategoryChange={(categoryId) => handleInputChange('category', categoryId)}
              onAddImageFiles={addImageFiles}
              onRemoveImage={removeImage}
              mediaDisabled={isSubmitting || productLoading}
            />

            <ProductPriceSection
              price={formData.price}
              compareAtPrice={formData.compareAtPrice}
              unitPriceTotalAmount={formData.unitPriceTotalAmount}
              unitPriceBaseMeasure={formData.unitPriceBaseMeasure}
              selectedUnit={formData.selectedUnit}
              selectedBaseMeasureUnit={formData.selectedBaseMeasureUnit}
              chargeTaxOnProduct={formData.chargeTaxOnProduct}
              cost={formData.cost}
              onPriceChange={(value) => handleInputChange('price', value)}
              onCompareAtPriceChange={(value) => handleInputChange('compareAtPrice', value)}
              onUnitPriceTotalAmountChange={(value) => handleInputChange('unitPriceTotalAmount', value)}
              onUnitPriceBaseMeasureChange={(value) => handleInputChange('unitPriceBaseMeasure', value)}
              onSelectedUnitChange={(value) => handleInputChange('selectedUnit', value)}
              onSelectedBaseMeasureUnitChange={(value) => handleInputChange('selectedBaseMeasureUnit', value)}
              onChargeTaxOnProductChange={(checked) => handleInputChange('chargeTaxOnProduct', checked)}
              onCostChange={(value) => handleInputChange('cost', value)}
            />

            <ProductInventorySection
              inventoryTrackingEnabled={formData.inventoryTrackingEnabled}
              sku={formData.sku}
              barcode={formData.barcode}
              onInventoryTrackingEnabledChange={(checked) =>
                handleInputChange('inventoryTrackingEnabled', checked)
              }
              onSkuChange={(value) => handleInputChange('sku', value)}
              onBarcodeChange={(value) => handleInputChange('barcode', value)}
            />

            <ProductShippingSection
              physicalProduct={formData.physicalProduct}
              selectedPackage={formData.selectedPackage}
              productWeight={formData.productWeight}
              weightUnit={formData.weightUnit}
              countryOfOrigin={formData.countryOfOrigin}
              hsCode={formData.hsCode}
              onPhysicalProductChange={(checked) => handleInputChange('physicalProduct', checked)}
              onSelectedPackageChange={(value) => handleInputChange('selectedPackage', value)}
              onProductWeightChange={(value) => handleInputChange('productWeight', value)}
              onWeightUnitChange={(value) => handleInputChange('weightUnit', value)}
              onCountryOfOriginChange={(value) => handleInputChange('countryOfOrigin', value)}
              onHsCodeChange={(value) => handleInputChange('hsCode', value)}
              activeStoreId={activeStoreId}
            />

            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Variants</h2>
              <div className="space-y-4">
                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Option {variantIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Option name
                        </label>
                        <input
                          type="text"
                          value={variant.optionName}
                          onChange={(e) => updateVariantOptionName(variantIndex, e.target.value)}
                          placeholder="e.g., Size, Color, Material"
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Option values
                        </label>
                        {variant.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="mb-2 flex gap-2">
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateVariantValue(variantIndex, valueIndex, e.target.value)
                              }
                              placeholder="Enter value"
                              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantValue(variantIndex, valueIndex)}
                              disabled={variant.values.length === 1}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVariantValue(variantIndex)}
                          className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add another value
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addVariant}
                className={`flex items-center gap-2 rounded-lg py-2 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 ${
                  formData.variants.length > 0 ? 'mt-4' : ''
                }`}
              >
                <PlusCircleIcon className="h-5 w-5 shrink-0 text-gray-700" aria-hidden />
                Add options like size or color
              </button>
            </div>

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

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <ProductStatusSection
              status={formData.status}
              onChange={(status) => handleInputChange('status', status)}
            />
            <ProductOrganizationSection
              productType={formData.productType}
              vendor={formData.vendor}
              tags={formData.tags}
              onProductTypeChange={(productTypeId) => handleInputChange('productType', productTypeId)}
              onVendorChange={(vendorId) => handleInputChange('vendor', vendorId)}
              onTagsChange={(tags) => handleInputChange('tags', tags)}
              activeStoreId={activeStoreId}
            />
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-900">Publishing</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  Online Store
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
