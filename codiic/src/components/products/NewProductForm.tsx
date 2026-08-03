import React from 'react';
import type { Product } from '../../contexts/product.context';
import { useNewProductForm } from '../../hooks/useNewProductForm';
import ProductBasicInformationSection from './ProductBasicInformationSection';
import ProductCategorySection from './ProductCategorySection';
import { ProductFormStage } from './ProductFormStage';
import ProductFormHeader from './ProductFormHeader';
import ProductLocationQuantitiesSection from './ProductLocationQuantitiesSection';
import ProductOrganizationSection from './ProductOrganizationSection';
import ProductPriceSection from './ProductPriceSection';
import ProductSearchEngineListingSection from './ProductSearchEngineListingSection';
import ProductShippingSection from './ProductShippingSection';
import ProductStatusSection from './ProductStatusSection';
import ProductVariantsSection from './ProductVariantsSection';
import {
  productFormAsideStackClass,
  productFormFlowMaxWidthClass,
  productFormGridClass,
  productFormMainStackClass,
  productFormPageClass,
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
    setVariantValues,
    setLocationQuantity,
  } = useNewProductForm({
    onSuccess,
    navigateOnSuccess: variant === 'page',
  });

  const isSheet = variant === 'sheet';
  const submitDisabled = productLoading || isSubmitting || !activeStoreId;
  const submitLabel =
    isSubmitting || productLoading ? 'Creating product...' : 'Add product';

  const runSubmit = () => {
    void handleSubmit();
  };

  return (
    <div
      className={
        isSheet ? 'bg-page-background-color' : productFormPageClass(FORM_APPEARANCE)
      }
    >
      <div
        className={
          isSheet
            ? 'px-4 py-4 sm:px-6'
            : productFormFlowMaxWidthClass(FORM_APPEARANCE)
        }
      >
        <ProductFormHeader
          mode="create"
          title="Add product"
          submitLabel={submitLabel}
          submitDisabled={submitDisabled}
          backLabel={backLabel}
          onBack={!isSheet ? onBack : undefined}
          onCancel={isSheet ? onCancel : undefined}
          onSubmit={runSubmit}
          appearance={FORM_APPEARANCE}
        />

        <p className="mb-6 max-w-xl text-[13px] leading-relaxed text-gray-500">
          Follow the steps below — name it, set a price, place it in a category, then
          decide how you stock and ship it.
        </p>

        <div className={productFormGridClass(FORM_APPEARANCE)}>
          <div className={productFormMainStackClass(FORM_APPEARANCE)}>
            <ProductFormStage
              step={1}
              title="Product details"
              description="What customers see first — name, story, and photos."
            >
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
                hideTitle
              />
            </ProductFormStage>

            <ProductFormStage
              step={2}
              title="Pricing"
              description="Set the selling price, SKU, and barcode. Extra options like compare-at and cost are optional."
            >
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
            </ProductFormStage>

            <ProductFormStage
              step={3}
              title="Category"
              description="Where this product sits in your catalog."
            >
              <ProductCategorySection
                category={formData.category}
                activeStoreId={activeStoreId}
                onCategoryChange={(categoryId) => handleInputChange('category', categoryId)}
                appearance={FORM_APPEARANCE}
                hideTitle
              />
            </ProductFormStage>

            <ProductFormStage
              step={4}
              title="Variants"
              description="Add sizes, colors, or other options if this product has more than one version."
              optional
            >
              <ProductVariantsSection
                variants={formData.variants}
                onAddVariant={addVariant}
                onRemoveVariant={removeVariant}
                onUpdateOptionName={updateVariantOptionName}
                onSetValues={setVariantValues}
                appearance={FORM_APPEARANCE}
              />
            </ProductFormStage>

            <ProductFormStage
              step={5}
              title="Inventory & shipping"
              description="Set starting stock at each location, then shipping details."
            >
              <ProductLocationQuantitiesSection
                activeStoreId={activeStoreId}
                quantities={formData.locationQuantities}
                onChange={setLocationQuantity}
                appearance={FORM_APPEARANCE}
              />
              <ProductShippingSection
                physicalProduct={formData.physicalProduct}
                selectedPackage={formData.selectedPackage}
                productWeight={formData.productWeight}
                weightUnit={formData.weightUnit}
                countryOfOrigin={formData.countryOfOrigin}
                hsCode={formData.hsCode}
                onPhysicalProductChange={(checked) =>
                  handleInputChange('physicalProduct', checked)
                }
                onSelectedPackageChange={(value) =>
                  handleInputChange('selectedPackage', value)
                }
                onProductWeightChange={(value) => handleInputChange('productWeight', value)}
                onWeightUnitChange={(value) => handleInputChange('weightUnit', value)}
                onCountryOfOriginChange={(value) =>
                  handleInputChange('countryOfOrigin', value)
                }
                onHsCodeChange={(value) => handleInputChange('hsCode', value)}
                activeStoreId={activeStoreId}
                appearance={FORM_APPEARANCE}
                hideTitle
              />
            </ProductFormStage>

            <ProductSearchEngineListingSection
              productTitle={formData.title}
              productDescription={formData.description}
              pageTitle={formData.pageTitle}
              metaDescription={formData.metaDescription}
              urlHandle={formData.urlHandle}
              onPageTitleChange={(value) => handleInputChange('pageTitle', value)}
              onMetaDescriptionChange={(value) =>
                handleInputChange('metaDescription', value)
              }
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
              onProductTypeChange={(productTypeId) =>
                handleInputChange('productType', productTypeId)
              }
              onVendorChange={(vendorId) => handleInputChange('vendor', vendorId)}
              onTagsChange={(tags) => handleInputChange('tags', tags)}
              activeStoreId={activeStoreId}
              appearance={FORM_APPEARANCE}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewProductForm;
