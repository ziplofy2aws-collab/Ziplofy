import { PlusCircleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { Product } from '../../contexts/product.context';
import { useNewProductForm } from '../../hooks/useNewProductForm';
import ProductBasicInformationSection from './ProductBasicInformationSection';
import ProductCategorySection from './ProductCategorySection';
import ProductFormHeader from './ProductFormHeader';
import ProductInventorySection from './ProductInventorySection';
import ProductOrganizationSection from './ProductOrganizationSection';
import ProductPriceSection from './ProductPriceSection';
import ProductSearchEngineListingSection from './ProductSearchEngineListingSection';
import ProductShippingSection from './ProductShippingSection';
import ProductStatusSection from './ProductStatusSection';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormInputClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from './product-form-appearance';

export type NewProductFormProps = {
  variant?: 'page' | 'sheet';
  backLabel?: string;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
  onBack?: () => void;
};

const FORM_APPEARANCE = 'minimal' as const;

export const NewProductForm: React.FC<NewProductFormProps> = ({
  variant = 'page',
  backLabel = 'Back to Products',
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
    displayImages,
    addImageUrl,
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
  const inputClass = productFormInputClass(FORM_APPEARANCE);

  return (
    <div
      className={
        isSheet ? 'bg-page-background-color' : productFormPageClass(FORM_APPEARANCE)
      }
    >
      <div className={isSheet ? 'px-4 py-4 sm:px-6' : 'mx-auto max-w-[1500px] px-3 py-4 sm:px-4'}>
        <ProductFormHeader
          mode="create"
          title="Add product"
          submitLabel={isSubmitting || productLoading ? 'Creating product...' : 'Add product'}
          submitDisabled={submitDisabled}
          backLabel={backLabel}
          onBack={!isSheet ? onBack : undefined}
          onCancel={isSheet ? onCancel : undefined}
          onSubmit={() => void handleSubmit()}
          appearance={FORM_APPEARANCE}
        />

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <ProductBasicInformationSection
              title={formData.title}
              description={formData.description}
              images={displayImages}
              onTitleChange={(value) => handleInputChange('title', value)}
              onDescriptionChange={(value) => handleInputChange('description', value)}
              onAddImageUrl={addImageUrl}
              onRemoveImage={removeImage}
              mediaDisabled={isSubmitting || productLoading}
              appearance={FORM_APPEARANCE}
            />

            <ProductCategorySection
              category={formData.category}
              activeStoreId={activeStoreId}
              onCategoryChange={(categoryId) => handleInputChange('category', categoryId)}
              appearance={FORM_APPEARANCE}
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
              onSelectedBaseMeasureUnitChange={(value) =>
                handleInputChange('selectedBaseMeasureUnit', value)
              }
              onChargeTaxOnProductChange={(checked) => handleInputChange('chargeTaxOnProduct', checked)}
              onCostChange={(value) => handleInputChange('cost', value)}
              appearance={FORM_APPEARANCE}
            />

            <ProductInventorySection
              inventoryTrackingEnabled={formData.inventoryTrackingEnabled}
              continueSellingWhenOutOfStock={formData.continueSellingWhenOutOfStock}
              sku={formData.sku}
              barcode={formData.barcode}
              onInventoryTrackingEnabledChange={(checked) =>
                handleInputChange('inventoryTrackingEnabled', checked)
              }
              onContinueSellingChange={(checked) =>
                handleInputChange('continueSellingWhenOutOfStock', checked)
              }
              onSkuChange={(value) => handleInputChange('sku', value)}
              onBarcodeChange={(value) => handleInputChange('barcode', value)}
              appearance={FORM_APPEARANCE}
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
              appearance={FORM_APPEARANCE}
            />

            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Variants</h2>
              <div className="space-y-3">
                {formData.variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="rounded-md border border-gray-200/60 bg-gray-50/40 p-3.5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Option {variantIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(variantIndex)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-normal text-gray-600">
                          Option name
                        </label>
                        <input
                          type="text"
                          value={variant.optionName}
                          onChange={(e) => updateVariantOptionName(variantIndex, e.target.value)}
                          placeholder="e.g., Size, Color, Material"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-normal text-gray-600">
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
                              className={`flex-1 ${inputClass}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeVariantValue(variantIndex, valueIndex)}
                              disabled={variant.values.length === 1}
                              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addVariantValue(variantIndex)}
                          className="mt-1.5 flex items-center gap-1.5 text-sm font-normal text-gray-500 transition-colors hover:text-gray-800"
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
                className={`flex items-center gap-2 rounded-md py-1.5 text-left text-sm font-normal text-gray-600 transition-colors hover:bg-gray-50 ${
                  formData.variants.length > 0 ? 'mt-3' : ''
                }`}
              >
                <PlusCircleIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
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
              appearance={FORM_APPEARANCE}
            />
          </div>

          <aside className={productFormAsideStackClass(FORM_APPEARANCE)}>
            <ProductStatusSection
              status={formData.status}
              onChange={(status) => handleInputChange('status', status)}
              appearance={FORM_APPEARANCE}
            />
            <ProductOrganizationSection
              productType={formData.productType}
              vendor={formData.vendor}
              tags={formData.tags}
              onProductTypeChange={(productTypeId) => handleInputChange('productType', productTypeId)}
              onVendorChange={(vendorId) => handleInputChange('vendor', vendorId)}
              onTagsChange={(tags) => handleInputChange('tags', tags)}
              activeStoreId={activeStoreId}
              appearance={FORM_APPEARANCE}
            />
            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Publishing</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600">
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

export default NewProductForm;
