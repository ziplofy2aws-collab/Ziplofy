import { PlusCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../contexts/product.context';
import { ProductVariant } from '../../contexts/product-variant.context';
import { useProductEditForm } from '../../hooks/useProductEditForm';
import ProductVariantsList from '../ProductVariantsList';
import ProductAddedBanner from './ProductAddedBanner';
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
  productFormMainStackClass,
  productFormPageClass,
  productFormSectionTitleClass,
} from './product-form-appearance';

type ProductEditFormProps = {
  product: Product;
  variants: ProductVariant[];
  variantsLoading: boolean;
  onAddVariants: () => void;
  onDeleteProduct: () => void;
  onUndeleteProduct: () => void;
  onDuplicate: () => void;
  isDuplicating?: boolean;
  showProductAddedBanner?: boolean;
  onDismissProductAddedBanner?: () => void;
  onAddAnotherProduct?: () => void;
};

const FORM_APPEARANCE = 'minimal' as const;

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  product,
  variants,
  variantsLoading,
  onAddVariants,
  onDeleteProduct,
  onUndeleteProduct,
  onDuplicate,
  isDuplicating = false,
  showProductAddedBanner = false,
  onDismissProductAddedBanner,
  onAddAnotherProduct,
}) => {
  const navigate = useNavigate();
  const {
    activeStoreId,
    formData,
    displayImages,
    handleInputChange,
    handleSave,
    isSaving,
    isDirty,
    addImageUrl,
    removeImage,
  } = useProductEditForm(product);

  const hasVariantOptions = (product.variants?.length ?? 0) > 0;
  const categoryDisplayName =
    formData.category &&
    product.category &&
    typeof product.category === 'object' &&
    formData.category === product.category._id
      ? product.category.name
      : undefined;

  return (
    <div className={productFormPageClass(FORM_APPEARANCE)}>
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
        {showProductAddedBanner && onDismissProductAddedBanner && onAddAnotherProduct ? (
          <ProductAddedBanner
            productTitle={formData.title || product.title || 'Product'}
            onDismiss={onDismissProductAddedBanner}
            onAddAnother={onAddAnotherProduct}
          />
        ) : null}

        <ProductFormHeader
          mode="edit"
          title={formData.title || product.title || 'Untitled product'}
          status={formData.status}
          isDeleted={Boolean(product.isDeleted)}
          submitLabel={isSaving ? 'Saving...' : 'Save'}
          submitDisabled={!isDirty || isSaving || isDuplicating}
          onBack={() => navigate('/products')}
          onSubmit={() => void handleSave()}
          onDuplicate={onDuplicate}
          duplicateDisabled={isDuplicating || isSaving}
          duplicateLabel={isDuplicating ? 'Duplicating...' : 'Duplicate'}
          onDeleteProduct={onDeleteProduct}
          onUndeleteProduct={onUndeleteProduct}
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
              mediaDisabled={isSaving}
              appearance={FORM_APPEARANCE}
            />

            <ProductCategorySection
              category={formData.category}
              categoryName={categoryDisplayName}
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
              sku={formData.sku}
              barcode={formData.barcode}
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

              {hasVariantOptions ? (
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant._id}
                      className="rounded-md border border-gray-200/60 bg-gray-50/40 p-3.5"
                    >
                      <h4 className="mb-1 text-sm font-medium text-gray-700">{variant.optionName}</h4>
                      <p className="text-[13px] text-gray-500">{variant.values.join(', ')}</p>
                    </div>
                  ))}
                  <ProductVariantsList
                    embedded
                    variants={variants}
                    productId={product._id}
                    loading={variantsLoading}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onAddVariants}
                  className="flex items-center gap-2 rounded-md py-1.5 text-left text-sm font-normal text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <PlusCircleIcon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                  Add options like size or color
                </button>
              )}
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
                {product.onlineStorePublishing ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600">
                    Online Store
                  </span>
                ) : null}
                {product.pointOfSalePublishing ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600">
                    Point of Sale
                  </span>
                ) : null}
                {!product.onlineStorePublishing && !product.pointOfSalePublishing ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100/80 px-2 py-0.5 text-xs font-normal text-gray-600">
                    Online Store
                  </span>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
