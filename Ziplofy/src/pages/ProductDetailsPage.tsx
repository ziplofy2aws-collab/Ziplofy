import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import AddOptionValuesModal from '../components/AddOptionValuesModal';
import AddProductVariantsModal from '../components/AddProductVariantsModal';
import ConfirmDeleteVariantModal from '../components/ConfirmDeleteVariantModal';
import ConfirmDeleteProductModal from '../components/ConfirmDeleteProductModal';
import ConfirmUndeleteProductModal from '../components/ConfirmUndeleteProductModal';
import DeleteVariantDimensionModal from '../components/DeleteVariantDimensionModal';
import ProductBasicInformation from '../components/ProductBasicInformation';
import ProductDetailsHeader from '../components/ProductDetailsHeader';
import ProductImagesGallery from '../components/ProductImagesGallery';
import ProductNotFound from '../components/ProductNotFound';
import ProductOptions from '../components/ProductOptions';
import ProductOrganization from '../components/ProductOrganization';
import ProductPricing from '../components/ProductPricing';
import ProductShippingInformation from '../components/ProductShippingInformation';
import ProductStatusDetails from '../components/ProductStatusDetails';
import ProductVariantsList from '../components/ProductVariantsList';
import { useAwsUpload } from '../contexts/aws-upload.context';
import { useProductVariants } from '../contexts/product-variant.context';
import { useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';

const extractS3KeyFromUrl = (imageUrl: string): string | null => {
  try {
    const parsed = new URL(imageUrl);
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    return key || null;
  } catch {
    return null;
  }
};

const getImageSrcListFromHtml = (html: string): string[] => {
  if (!html?.trim()) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('img[src]'))
    .map((img) => img.getAttribute('src') || '')
    .filter(Boolean);
};

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const {
    activeProduct,
    activeProductLoading,
    addVariantsToProduct,
    deleteVariantFromProduct,
    addOptionToProduct,
    deleteProduct,
    fetchProductById,
    clearActiveProduct,
    updateProduct,
  } =
    useProducts();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { uploadImageWithSignedUrl, deleteImagesFromS3 } = useAwsUpload();
  const { fetchVariantsByProductId, variants, loading } = useProductVariants();
  const product = activeProduct;

  useEffect(() => {
    if (id) {
      fetchProductById(id).catch(() => {
        // errors handled by context and not-found state
      });
    }
    return () => {
      clearActiveProduct();
    };
  }, [id, fetchProductById, clearActiveProduct]);

  const [addVariantsOpen, setAddVariantsOpen] = useState(false);
  const [variantsForm, setVariantsForm] = useState<Array<{ optionName: string; values: string[] }>>([
    { optionName: '', values: [''] },
  ]);

  const [deleteVariantOpen, setDeleteVariantOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState('');
  const [deletingVariant, setDeletingVariant] = useState(false);

  const [addOptionOpen, setAddOptionOpen] = useState(false);
  const [selectedOptionName, setSelectedOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState<string[]>(['']);
  const [submittingOption, setSubmittingOption] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [undeleteProductOpen, setUndeleteProductOpen] = useState(false);
  const [undeletingProduct, setUndeletingProduct] = useState(false);
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [savingProductBasicCard, setSavingProductBasicCard] = useState(false);
  const [savingPricingCard, setSavingPricingCard] = useState(false);
  const [savingOrganizationCard, setSavingOrganizationCard] = useState(false);
  const [savingShippingCard, setSavingShippingCard] = useState(false);
  const [savingMediaCard, setSavingMediaCard] = useState(false);

  const dataUrlToFile = useCallback((dataUrl: string, fallbackName: string): File | null => {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64Data = match[2];
    const binary = window.atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const extension = mimeType.split('/')[1] || 'png';
    return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
  }, []);

  const uploadDescriptionImagesForEdit = useCallback(
    async (descriptionHtml: string) => {
      if (!descriptionHtml.trim()) {
        return {
          html: descriptionHtml,
          uploadedUrls: [] as string[],
        };
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(descriptionHtml, 'text/html');
      const imageNodes = Array.from(doc.querySelectorAll('img[src]'));
      const localImages = imageNodes.filter((img) => {
        const src = img.getAttribute('src') || '';
        return src.startsWith('data:image/') || src.startsWith('blob:');
      });

      if (!localImages.length) {
        return {
          html: descriptionHtml,
          uploadedUrls: [] as string[],
        };
      }

      const folderStoreId = activeStoreId || product?.storeId;
      if (!folderStoreId) {
        throw new Error('Store is required to upload description images');
      }

      const uploadToastId = toast.loading(
        `Uploading ${localImages.length} description image${localImages.length > 1 ? 's' : ''}...`
      );

      const uploadedUrls: string[] = [];
      try {
        await Promise.all(
          localImages.map(async (img, index) => {
            const src = img.getAttribute('src') || '';
            let file: File | null = null;

            if (src.startsWith('data:image/')) {
              file = dataUrlToFile(src, `description-image-${index + 1}`);
            } else if (src.startsWith('blob:')) {
              const blob = await fetch(src).then((res) => res.blob());
              const extension = (blob.type || 'image/png').split('/')[1] || 'png';
              file = new File([blob], `description-image-${index + 1}.${extension}`, {
                type: blob.type || 'image/png',
              });
            }

            if (!file) return;
            const uploaded = await uploadImageWithSignedUrl(file, {
              folder: `${folderStoreId}/product-description-image`,
            });
            uploadedUrls.push(uploaded.objectUrl);
            img.setAttribute('src', uploaded.objectUrl);
          })
        );
        toast.success('Description images uploaded', { id: uploadToastId });
        return { html: doc.body.innerHTML, uploadedUrls };
      } catch (error) {
        toast.error('Failed to upload description images', { id: uploadToastId });
        throw error;
      }
    },
    [activeStoreId, dataUrlToFile, product?.storeId, uploadImageWithSignedUrl]
  );

  const handleOpenAddVariants = useCallback(() => {
    setAddVariantsOpen(true);
  }, []);

  const handleCloseAddVariants = useCallback(() => {
    setAddVariantsOpen(false);
    setVariantsForm([{ optionName: '', values: [''] }]);
  }, []);

  const handleOpenDeleteVariant = useCallback(() => {
    setDeleteVariantOpen(true);
  }, []);

  const handleCloseDeleteVariant = useCallback(() => {
    setDeleteVariantOpen(false);
    setSelectedDimension('');
  }, []);

  const handleOpenConfirmDelete = useCallback(() => {
    if (selectedDimension) {
      setDeleteVariantOpen(false);
      setConfirmDeleteOpen(true);
    }
  }, [selectedDimension]);

  const handleCloseConfirmDelete = useCallback(() => {
    setConfirmDeleteOpen(false);
    setSelectedDimension('');
  }, []);

  const handleOpenAddOption = useCallback(() => {
    setAddOptionOpen(true);
  }, []);

  const handleOpenDeleteProduct = useCallback(() => {
    setDeleteProductOpen(true);
  }, []);

  const handleCloseDeleteProduct = useCallback(() => {
    setDeleteProductOpen(false);
  }, []);

  const handleOpenUndeleteProduct = useCallback(() => {
    setUndeleteProductOpen(true);
  }, []);

  const handleCloseUndeleteProduct = useCallback(() => {
    setUndeleteProductOpen(false);
  }, []);

  const handleCloseAddOption = useCallback(() => {
    setAddOptionOpen(false);
    setSelectedOptionName('');
    setNewOptionValues(['']);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!product || !selectedDimension) return;

    try {
      setDeletingVariant(true);
      await deleteVariantFromProduct(product._id, selectedDimension);
      await fetchVariantsByProductId(product._id);
      handleCloseConfirmDelete();
    } catch (error) {
      console.error('Failed to delete variant dimension:', error);
    } finally {
      setDeletingVariant(false);
    }
  }, [product, selectedDimension, deleteVariantFromProduct, fetchVariantsByProductId, handleCloseConfirmDelete]);

  const addVariantRow = useCallback(() => {
    setVariantsForm((prev) => [...prev, { optionName: '', values: [''] }]);
  }, []);

  const removeVariantRow = useCallback((index: number) => {
    setVariantsForm((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateVariantOptionName = useCallback((index: number, optionName: string) => {
    setVariantsForm((prev) => prev.map((v, i) => (i === index ? { ...v, optionName } : v)));
  }, []);

  const addVariantValue = useCallback((variantIndex: number) => {
    setVariantsForm((prev) =>
      prev.map((v, i) => (i === variantIndex ? { ...v, values: [...v.values, ''] } : v))
    );
  }, []);

  const removeVariantValue = useCallback((variantIndex: number, valueIndex: number) => {
    setVariantsForm((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, values: v.values.filter((_, j) => j !== valueIndex) } : v
      )
    );
  }, []);

  const updateVariantValue = useCallback((variantIndex: number, valueIndex: number, value: string) => {
    setVariantsForm((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, values: v.values.map((val, j) => (j === valueIndex ? value : val)) }
          : v
      )
    );
  }, []);

  const [submittingVariants, setSubmittingVariants] = useState(false);

  const handleSubmitAddVariants = useCallback(async () => {
    if (!id) return;
    const payload = variantsForm
      .map((v) => ({
        optionName: v.optionName.trim(),
        values: v.values.map((val) => val.trim()).filter(Boolean),
      }))
      .filter((v) => v.optionName && v.values.length > 0);
    if (payload.length === 0) return;
    try {
      setSubmittingVariants(true);
      await addVariantsToProduct(id, payload);
      handleCloseAddVariants();
      fetchVariantsByProductId(id);
    } catch {
      // errors from context
    } finally {
      setSubmittingVariants(false);
    }
  }, [id, variantsForm, addVariantsToProduct, fetchVariantsByProductId, handleCloseAddVariants]);

  const handleSubmitAddOption = useCallback(async () => {
    if (!id || !selectedOptionName) return;
    const validValues = newOptionValues.filter((val) => val.trim().length > 0);
    if (validValues.length === 0) return;

    try {
      setSubmittingOption(true);
      await addOptionToProduct(id, selectedOptionName, validValues);
      handleCloseAddOption();
      fetchVariantsByProductId(id);
    } catch (e) {
      console.error('Error adding option values:', e);
    } finally {
      setSubmittingOption(false);
    }
  }, [id, selectedOptionName, newOptionValues, addOptionToProduct, fetchVariantsByProductId, handleCloseAddOption]);

  const handleConfirmDeleteProduct = useCallback(async () => {
    if (!product) return;
    try {
      setDeletingProduct(true);
      await deleteProduct(product._id);
      setDeleteProductOpen(false);
      navigate('/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setDeletingProduct(false);
    }
  }, [product, deleteProduct, navigate]);

  const handleConfirmUndeleteProduct = useCallback(async () => {
    if (!product) return;
    try {
      setUndeletingProduct(true);
      await updateProduct(product._id, { isDeleted: false });
      toast.success('Product restored');
      setUndeleteProductOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to un-delete product';
      toast.error(message);
    } finally {
      setUndeletingProduct(false);
    }
  }, [product, updateProduct]);

  const handleSaveBasicInfo = useCallback(
    async (payload: { title: string; description: string }) => {
      if (!product) return;
      try {
        setSavingBasicInfo(true);

        const previousDescription = product.description || '';
        const { html: nextDescription } = await uploadDescriptionImagesForEdit(
          payload.description || ''
        );

        const oldS3Urls = getImageSrcListFromHtml(previousDescription).filter((url) =>
          Boolean(extractS3KeyFromUrl(url))
        );
        const newS3Urls = getImageSrcListFromHtml(nextDescription).filter((url) =>
          Boolean(extractS3KeyFromUrl(url))
        );
        const removedDescriptionImageUrls = oldS3Urls.filter(
          (url) => !newS3Urls.includes(url)
        );

        if (removedDescriptionImageUrls.length > 0) {
          const removeToastId = toast.loading(
            `Deleting ${removedDescriptionImageUrls.length} removed description image${
              removedDescriptionImageUrls.length > 1 ? 's' : ''
            }...`
          );
          const removedDescriptionImageKeys = removedDescriptionImageUrls
            .map((url) => extractS3KeyFromUrl(url))
            .filter((key): key is string => Boolean(key));
          await deleteImagesFromS3({
            imageKeys: removedDescriptionImageKeys,
            imageUrls: removedDescriptionImageUrls,
          });
          toast.success('Removed description images deleted', { id: removeToastId });
        }

        await updateProduct(product._id, {
          title: payload.title,
          description: nextDescription,
        });
        toast.success('Product details updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update product details';
        toast.error(message);
        throw error;
      } finally {
        setSavingBasicInfo(false);
      }
    },
    [product, uploadDescriptionImagesForEdit, deleteImagesFromS3, updateProduct]
  );

  const handleSaveProductBasicCard = useCallback(
    async (payload: { category: string; sku: string; barcode: string }) => {
      if (!product) return;
      try {
        setSavingProductBasicCard(true);
        await updateProduct(product._id, {
          category: payload.category,
          sku: payload.sku,
          barcode: payload.barcode,
        });
        toast.success('Basic information updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update basic information';
        toast.error(message);
        throw error;
      } finally {
        setSavingProductBasicCard(false);
      }
    },
    [product, updateProduct]
  );

  const handleSavePricingCard = useCallback(
    async (payload: {
      price: number;
      compareAtPrice?: number;
      cost: number;
      profit: number;
      marginPercent: number;
      unitPriceTotalAmount?: number;
      unitPriceTotalAmountMetric?: string;
      unitPriceBaseMeasure?: number;
      unitPriceBaseMeasureMetric?: string;
    }) => {
      if (!product) return;
      try {
        setSavingPricingCard(true);
        await updateProduct(product._id, {
          price: payload.price,
          compareAtPrice: payload.compareAtPrice,
          cost: payload.cost,
          profit: payload.profit,
          marginPercent: payload.marginPercent,
          unitPriceTotalAmount: payload.unitPriceTotalAmount,
          unitPriceTotalAmountMetric: payload.unitPriceTotalAmountMetric,
          unitPriceBaseMeasure: payload.unitPriceBaseMeasure,
          unitPriceBaseMeasureMetric: payload.unitPriceBaseMeasureMetric,
        });
        toast.success('Pricing updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update pricing';
        toast.error(message);
        throw error;
      } finally {
        setSavingPricingCard(false);
      }
    },
    [product, updateProduct]
  );

  const handleSaveOrganizationCard = useCallback(
    async (payload: { productType: string; vendor: string; tagIds: string[] }) => {
      if (!product) return;
      try {
        setSavingOrganizationCard(true);
        await updateProduct(product._id, {
          productType: payload.productType,
          vendor: payload.vendor,
          tagIds: payload.tagIds,
        });
        toast.success('Organization updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update organization';
        toast.error(message);
        throw error;
      } finally {
        setSavingOrganizationCard(false);
      }
    },
    [product, updateProduct]
  );

  const handleSaveShippingCard = useCallback(
    async (payload: {
      package?: string;
      productWeight?: number;
      productWeightUnit?: string;
      countryOfOrigin?: string;
      harmonizedSystemCode?: string;
    }) => {
      if (!product) return;
      try {
        setSavingShippingCard(true);
        await updateProduct(product._id, {
          package: payload.package,
          productWeight: payload.productWeight,
          productWeightUnit: payload.productWeightUnit,
          countryOfOrigin: payload.countryOfOrigin,
          harmonizedSystemCode: payload.harmonizedSystemCode,
        });
        toast.success('Shipping information updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update shipping information';
        toast.error(message);
        throw error;
      } finally {
        setSavingShippingCard(false);
      }
    },
    [product, updateProduct]
  );

  const handleSaveMediaCard = useCallback(
    async (payload: { retainedImageUrls: string[]; newImageFiles: File[] }) => {
      if (!product) return;
      if (payload.retainedImageUrls.length + payload.newImageFiles.length === 0) {
        toast.error('At least one image is required');
        throw new Error('At least one image is required');
      }

      try {
        setSavingMediaCard(true);
        const folderStoreId = activeStoreId || product.storeId;
        const existingUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        const removedImageUrls = existingUrls.filter((url) => !payload.retainedImageUrls.includes(url));
        const removedImageKeys = removedImageUrls
          .map((url) => extractS3KeyFromUrl(url))
          .filter((key): key is string => Boolean(key));

        if (removedImageUrls.length > 0) {
          const deleteToast = toast.loading(
            `Deleting ${removedImageUrls.length} image${removedImageUrls.length > 1 ? 's' : ''}...`
          );
          await deleteImagesFromS3({ imageKeys: removedImageKeys, imageUrls: removedImageUrls });
          toast.success('Removed images deleted', { id: deleteToast });
        }

        let uploadedUrls: string[] = [];
        if (payload.newImageFiles.length > 0) {
          const uploadToast = toast.loading(
            `Uploading ${payload.newImageFiles.length} image${payload.newImageFiles.length > 1 ? 's' : ''}...`
          );
          const uploaded = await Promise.all(
            payload.newImageFiles.map((file) =>
              uploadImageWithSignedUrl(file, { folder: `${folderStoreId}/product-image` })
            )
          );
          uploadedUrls = uploaded.map((item) => item.objectUrl);
          toast.success('Images uploaded', { id: uploadToast });
        }

        const finalImageUrls = [...payload.retainedImageUrls, ...uploadedUrls];
        await updateProduct(product._id, { imageUrls: finalImageUrls });
        toast.success('Media updated');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update media';
        toast.error(message);
        throw error;
      } finally {
        setSavingMediaCard(false);
      }
    },
    [product, activeStoreId, deleteImagesFromS3, uploadImageWithSignedUrl, updateProduct]
  );

  const updateNewOptionValue = useCallback((index: number, value: string) => {
    setNewOptionValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addNewOptionValue = useCallback(() => {
    setNewOptionValues((prev) => [...prev, '']);
  }, []);

  const removeNewOptionValue = useCallback((index: number) => {
    setNewOptionValues((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [''];
    });
  }, []);

  useEffect(() => {
    if (id) {
      fetchVariantsByProductId(id);
    }
  }, [id, fetchVariantsByProductId]);

  if (activeProductLoading) {
    return null;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        <ProductDetailsHeader
          product={product}
          variantsCount={variants.length}
          onDeleteProduct={handleOpenDeleteProduct}
          onUndeleteProduct={handleOpenUndeleteProduct}
          onSaveBasicInfo={handleSaveBasicInfo}
          isSavingBasicInfo={savingBasicInfo}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6 xl:col-span-2">
            <ProductImagesGallery
              imageUrls={product.imageUrls || []}
              onSave={handleSaveMediaCard}
              isSaving={savingMediaCard}
            />
            <ProductBasicInformation
              product={product}
              onSave={handleSaveProductBasicCard}
              isSaving={savingProductBasicCard}
            />
            <ProductPricing
              product={product}
              onSave={handleSavePricingCard}
              isSaving={savingPricingCard}
            />
            <ProductOrganization
              product={product}
              activeStoreId={activeStoreId}
              onSave={handleSaveOrganizationCard}
              isSaving={savingOrganizationCard}
            />
            <ProductShippingInformation
              product={product}
              activeStoreId={activeStoreId}
              onSave={handleSaveShippingCard}
              isSaving={savingShippingCard}
            />
            <ProductOptions
              product={product}
              onAddVariants={handleOpenAddVariants}
              onAddOption={handleOpenAddOption}
              onDeleteVariantDimension={handleOpenDeleteVariant}
            />
            <ProductVariantsList variants={variants} productId={id || ''} loading={loading} />
          </div>

          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-6">
              <ProductStatusDetails product={product} />
            </div>
          </div>
        </div>
      </div>

      <AddProductVariantsModal
        isOpen={addVariantsOpen}
        variantsForm={variantsForm}
        submittingVariants={submittingVariants}
        onClose={handleCloseAddVariants}
        onSubmit={handleSubmitAddVariants}
        onAddVariantRow={addVariantRow}
        onRemoveVariantRow={removeVariantRow}
        onUpdateVariantOptionName={updateVariantOptionName}
        onAddVariantValue={addVariantValue}
        onRemoveVariantValue={removeVariantValue}
        onUpdateVariantValue={updateVariantValue}
      />

      <DeleteVariantDimensionModal
        isOpen={deleteVariantOpen}
        product={product}
        selectedDimension={selectedDimension}
        onClose={handleCloseDeleteVariant}
        onContinue={handleOpenConfirmDelete}
        onDimensionChange={setSelectedDimension}
      />

      <ConfirmDeleteVariantModal
        isOpen={confirmDeleteOpen}
        selectedDimension={selectedDimension}
        deletingVariant={deletingVariant}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleConfirmDelete}
      />

      <AddOptionValuesModal
        isOpen={addOptionOpen}
        product={product}
        selectedOptionName={selectedOptionName}
        newOptionValues={newOptionValues}
        submittingOption={submittingOption}
        onClose={handleCloseAddOption}
        onSubmit={handleSubmitAddOption}
        onOptionNameChange={setSelectedOptionName}
        onUpdateNewOptionValue={updateNewOptionValue}
        onAddNewOptionValue={addNewOptionValue}
        onRemoveNewOptionValue={removeNewOptionValue}
      />

      <ConfirmDeleteProductModal
        isOpen={deleteProductOpen}
        productTitle={product.title}
        deletingProduct={deletingProduct}
        onClose={handleCloseDeleteProduct}
        onConfirm={handleConfirmDeleteProduct}
      />
      <ConfirmUndeleteProductModal
        isOpen={undeleteProductOpen}
        productTitle={product.title}
        undeletingProduct={undeletingProduct}
        onClose={handleCloseUndeleteProduct}
        onConfirm={handleConfirmUndeleteProduct}
      />
    </div>
  );
};

export default ProductDetailsPage;
