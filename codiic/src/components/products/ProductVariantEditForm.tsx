import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../contexts/product.context';
import { ProductVariant } from '../../contexts/product-variant.context';
import {
  getVariantDisplayTitle,
  useProductVariantEditForm,
} from '../../hooks/useProductVariantEditForm';
import ProductFormHeader from './ProductFormHeader';
import ProductImagesSection from './ProductImagesSection';
import ProductPriceSection from './ProductPriceSection';
import ProductShippingSection from './ProductShippingSection';
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
  const productTitle = product.title || 'Untitled product';

  return (
    <div className={productFormPageClass(FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        <ProductFormHeader
          mode="edit"
          title={variantTitle}
          subtitle={
            <button
              type="button"
              onClick={() => navigate(`/products/${product._id}`)}
              className="text-left transition-colors hover:text-gray-600 hover:underline"
            >
              {productTitle}
            </button>
          }
          submitLabel={isSaving ? 'Saving...' : 'Save'}
          submitDisabled={!isDirty || isSaving}
          backLabel="Back to product"
          onBack={() => navigate(`/products/${product._id}`)}
          onSubmit={() => void handleSave()}
          appearance={FORM_APPEARANCE}
        />

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Media</h2>
              <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
                Images shown for this variant in the storefront
              </p>
              <ProductImagesSection
                embedded
                images={displayImages}
                onAddImageUrl={addImageUrl}
                onRemoveImage={removeImage}
                disabled={isSaving}
                appearance={FORM_APPEARANCE}
              />
            </div>

            <ProductPriceSection
              price={formData.price}
              compareAtPrice={formData.compareAtPrice}
              unitPriceTotalAmount={formData.unitPriceTotalAmount}
              unitPriceBaseMeasure={formData.unitPriceBaseMeasure}
              selectedUnit={formData.selectedUnit}
              selectedBaseMeasureUnit={formData.selectedBaseMeasureUnit}
              chargeTaxOnProduct={formData.chargeTaxOnProduct}
              cost={formData.cost}
              sku={formData.sku}
              barcode={formData.barcode}
              onPriceChange={(value) => handleInputChange('price', value)}
              onCompareAtPriceChange={(value) => handleInputChange('compareAtPrice', value)}
              onUnitPriceTotalAmountChange={(value) =>
                handleInputChange('unitPriceTotalAmount', value)
              }
              onUnitPriceBaseMeasureChange={(value) =>
                handleInputChange('unitPriceBaseMeasure', value)
              }
              onSelectedUnitChange={(value) => handleInputChange('selectedUnit', value)}
              onSelectedBaseMeasureUnitChange={(value) =>
                handleInputChange('selectedBaseMeasureUnit', value)
              }
              onChargeTaxOnProductChange={(checked) =>
                handleInputChange('chargeTaxOnProduct', checked)
              }
              onCostChange={(value) => handleInputChange('cost', value)}
              onSkuChange={(value) => handleInputChange('sku', value)}
              onBarcodeChange={(value) => handleInputChange('barcode', value)}
              appearance={FORM_APPEARANCE}
            />

            <ProductVariantInventorySection
              inventoryTrackingEnabled={formData.inventoryTrackingEnabled}
              continueSellingWhenOutOfStock={formData.outOfStockContinueSelling}
              onInventoryTrackingEnabledChange={(checked) =>
                handleInputChange('inventoryTrackingEnabled', checked)
              }
              onContinueSellingChange={(checked) =>
                handleInputChange('outOfStockContinueSelling', checked)
              }
              appearance={FORM_APPEARANCE}
            />

            <ProductShippingSection
              physicalProduct={formData.isPhysicalProduct}
              selectedPackage={formData.selectedPackage}
              productWeight={formData.productWeight}
              weightUnit={formData.weightUnit}
              countryOfOrigin={formData.countryOfOrigin}
              hsCode={formData.hsCode}
              onPhysicalProductChange={(checked) =>
                handleInputChange('isPhysicalProduct', checked)
              }
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
            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Options</h2>
              <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
                Managed on the product page
              </p>
              {optionEntries.length > 0 ? (
                <div className="space-y-2">
                  {optionEntries.map(([key, value]) => (
                    <div
                      key={`${key}-${value}`}
                      className="rounded-md border border-gray-200/60 bg-gray-50/40 px-3 py-2"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {key}
                      </p>
                      <p className="mt-0.5 text-[13px] text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-gray-500">
                  {displayVariant.isSynthetic
                    ? 'Default variant — no options configured'
                    : 'No option values on this variant'}
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate(`/products/${product._id}`)}
                className="mt-3 text-[12px] font-normal text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              >
                Edit options on product
              </button>
            </div>

            <div className={productFormCardClass(FORM_APPEARANCE)}>
              <h2 className={productFormSectionTitleClass(FORM_APPEARANCE)}>Product</h2>
              <p className="-mt-1 mb-3 text-[12px] leading-snug text-gray-400">
                Parent catalog item for this variant
              </p>
              <button
                type="button"
                onClick={() => navigate(`/products/${product._id}`)}
                className="w-full rounded-md border border-gray-200/60 bg-gray-50/40 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <p className="truncate text-[13px] font-medium text-gray-800">{productTitle}</p>
                <p className="mt-0.5 text-[12px] text-gray-400">Open product details</p>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantEditForm;
