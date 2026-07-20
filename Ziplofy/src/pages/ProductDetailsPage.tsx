import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AddProductVariantsModal from '../components/AddProductVariantsModal';
import ConfirmDeleteProductModal from '../components/ConfirmDeleteProductModal';
import ConfirmUndeleteProductModal from '../components/ConfirmUndeleteProductModal';
import ProductNotFound from '../components/ProductNotFound';
import ProductFormPageSkeleton from '../components/products/ProductFormPageSkeleton';
import { ProductEditForm } from '../components/products/ProductEditForm';
import { useProductVariants } from '../contexts/product-variant.context';
import { useProducts } from '../contexts/product.context';
import { useStore } from '../contexts/store.context';
import { readProductJustCreated } from '../utils/product-navigation.util';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const productJustCreatedOnMount = useRef(readProductJustCreated(location.state));
  const previousProductIdRef = useRef(id);
  const [showProductAddedBanner, setShowProductAddedBanner] = useState(
    () => productJustCreatedOnMount.current
  );
  const {
    activeProduct,
    activeProductLoading,
    addVariantsToProduct,
    deleteProduct,
    duplicateProduct,
    fetchProductById,
    clearActiveProduct,
    updateProduct,
  } = useProducts();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
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
  const [submittingVariants, setSubmittingVariants] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [undeleteProductOpen, setUndeleteProductOpen] = useState(false);
  const [undeletingProduct, setUndeletingProduct] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleOpenAddVariants = useCallback(() => {
    setAddVariantsOpen(true);
  }, []);

  const handleCloseAddVariants = useCallback(() => {
    setAddVariantsOpen(false);
    setVariantsForm([{ optionName: '', values: [''] }]);
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
      await fetchVariantsByProductId(id);
      await fetchProductById(id);
    } catch {
      // errors from context
    } finally {
      setSubmittingVariants(false);
    }
  }, [id, variantsForm, addVariantsToProduct, fetchVariantsByProductId, fetchProductById, handleCloseAddVariants]);

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
    } catch (error) {
      console.error('Failed to un-delete product:', error);
    } finally {
      setUndeletingProduct(false);
    }
  }, [product, updateProduct]);

  const handleDuplicateProduct = useCallback(async () => {
    if (!product) return;
    const storeId = activeStoreId || product.storeId;
    if (!storeId) {
      toast.error('Please select a store first');
      return;
    }

    try {
      setIsDuplicating(true);
      const duplicated = await duplicateProduct(product, storeId);
      toast.success('Product duplicated');
      navigate(`/products/${duplicated._id}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to duplicate product');
    } finally {
      setIsDuplicating(false);
    }
  }, [product, activeStoreId, duplicateProduct, navigate]);

  useEffect(() => {
    if (productJustCreatedOnMount.current) {
      productJustCreatedOnMount.current = false;
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (previousProductIdRef.current !== id) {
      previousProductIdRef.current = id;
      setShowProductAddedBanner(false);
    }
  }, [id]);

  const handleDismissProductAddedBanner = useCallback(() => {
    setShowProductAddedBanner(false);
  }, []);

  const handleAddAnotherProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchVariantsByProductId(id);
    }
  }, [id, fetchVariantsByProductId]);

  if (activeProductLoading) {
    return <ProductFormPageSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <>
      <ProductEditForm
        product={product}
        variants={variants}
        variantsLoading={loading}
        onAddVariants={handleOpenAddVariants}
        onDeleteProduct={handleOpenDeleteProduct}
        onUndeleteProduct={handleOpenUndeleteProduct}
        onDuplicate={() => void handleDuplicateProduct()}
        isDuplicating={isDuplicating}
        showProductAddedBanner={showProductAddedBanner}
        onDismissProductAddedBanner={handleDismissProductAddedBanner}
        onAddAnotherProduct={handleAddAnotherProduct}
      />

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
    </>
  );
};

export default ProductDetailsPage;
