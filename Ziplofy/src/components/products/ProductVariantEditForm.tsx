import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../contexts/product.context';
import { ProductVariant } from '../../contexts/product-variant.context';
import {
  getVariantDisplayTitle,
  useProductVariantEditForm,
} from '../../hooks/useProductVariantEditForm';
import ProductImagesSection from './ProductImagesSection';
import ProductPriceSection from './ProductPriceSection';
import ProductShippingSection from './ProductShippingSection';
import ProductVariantFormHeader from './ProductVariantFormHeader';
import ProductVariantInventorySection from './ProductVariantInventorySection';
import {
  productFormAsideStackClass,
  productFormCardClass,
  productFormGridClass,
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from './product-form-appearance';

type ProductVariantEditFormProps = {
  product: Product;
  variant: ProductVariant;
};

const FORM_APPEARANCE = 'minimal' as const;

export const ProductVariantEditForm: React.FC<ProductVariantEditFormProps> = ({
  product,
  variant,
}) => {
  const navigate = useNavigate();
  const {
    activeStoreId,
    formData,
    displayVariant,
    displayImages,
    handleInputChange,
    handleSave,
    isSaving,
    isDirty,
    addImageUrl,
    removeImage,
  } = useProductVariantEditForm(variant);

  const variantTitle = getVariantDisplayTitle(displayVariant);
  const optionEntries = Object.entries(displayVariant.optionValues || {});

  return (
    <div className={productFormPageClass(FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <ProductVariantFormHeader
          title={variantTitle}
          productTitle={product.title || 'Untitled product'}
          submitLabel={isSaving ? 'Saving...' : 'Save'}
          submitDisabled={!isDirty || isSaving}
          onBack={() => navigate(`/products/${product._id}`)}
          onSubmit={() => void handleSave()}
          appearance={FORM_APPEARANCE}
        />

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <ProductImagesSection
              images={displayImages}
              onAddImageUrl={addImageUrl}
              onRemoveImage={removeImage}
              disabled={isSaving}
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

            <ProductVariantInventorySection
              inventoryTrackingEnabled={formData.inventoryTrackingEnabled}
              continueSellingWhenOutOfStock={formData.outOfStockContinueSelling}
              sku={formData.sku}
              barcode={formData.barcode}
              onInventoryTrackingEnabledChange={(checked) =>
                handleInputChange('inventoryTrackingEnabled', checked)
              }
              onContinueSellingChange={(checked) =>
                handleInputChange('outOfStockContinueSelling', checked)
              }
              onSkuChange={(value) => handleInputChange('sku', value)}
              onBarcodeChange={(value) => handleInputChange('barcode', value)}
              appearance={FORM_APPEARANCE}
            />

            <ProductShippingSection
              physicalProduct={formData.isPhysicalProduct}
              selectedPackage={formData.selectedPackage}
              productWeight={formData.productWeight}
              weightUnit={formData.weightUnit}
              countryOfOrigin={formData.countryOfOrigin}
              hsCode={formData.hsCode}
              onPhysicalProductChange={(checked) => handleInputChange('isPhysicalProduct', checked)}
              onSelectedPackageChange={(value) => handleInputChange('selectedPackage', value)}
              onProductWeightChange={(value) => handleInputChange('productWeight', value)}
              onWeightUnitChange={(value) => handleInputChange('weightUnit', value)}
              onCountryOfOriginChange={(value) => handleInputChange('countryOfOrigin', value)}
              onHsCodeChange={(value) => handleInputChange('hsCode', value)}
              activeStoreId={activeStoreId}
              appearance={FORM_APPEARANCE}
            />
          </div>

          <aside className={productFormAsideStackClass(FORM_APPEARANCE)}>
            {optionEntries.length > 0 ? (
              <div className={productFormCardClass(FORM_APPEARANCE)}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Options</h2>
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="shrink-0 text-[12px] font-normal text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                  >
                    Edit on product
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {optionEntries.map(([key, value]) => (
                    <span
                      key={`${key}-${value}`}
                      className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-gray-400">
                  Option names and values are managed from the product page.
                </p>
              </div>
            ) : null}

            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Summary</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">SKU</p>
                  <p className="mt-1 font-mono text-[13px] text-gray-700">
                    {formData.sku.trim() || displayVariant.sku || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Price</p>
                  <p className="mt-1 text-[13px] text-gray-700">
                    {formData.price.trim() ? `₹${Number(formData.price).toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Inventory</p>
                  <p className="mt-1 text-[13px] text-gray-700">
                    {formData.inventoryTrackingEnabled ? 'Tracked' : 'Not tracked'}
                  </p>
                </div>
                {displayVariant.isSynthetic ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Type</p>
                    <p className="mt-1 text-[13px] text-gray-600">Default variant</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Last saved</p>
                  <p className="mt-1 text-[13px] text-gray-600">
                    {new Date(displayVariant.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
