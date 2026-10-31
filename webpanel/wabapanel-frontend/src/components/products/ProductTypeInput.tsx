import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ProductType, useProductType } from "../../contexts/product-type.context";
import {
  type ProductFormAppearance,
  productFormInputClass,
  productFormLabelClass,
} from "./product-form-appearance";
import ProductTypeMenu from "./ProductTypeMenu";

interface ProductTypeInputProps {
  selectedProductTypeId: string;
  activeStoreId: string | null;
  onProductTypeChange: (productTypeId: string) => void;
  appearance?: ProductFormAppearance;
}

const ProductTypeInput: React.FC<ProductTypeInputProps> = ({
  selectedProductTypeId,
  activeStoreId,
  onProductTypeChange,
  appearance = "default",
}) => {
  const { productTypes, getProductTypesByStoreId, createProductType } = useProductType();

  const [productTypeQuery, setProductTypeQuery] = useState("");
  const [productTypeMenuOpen, setProductTypeMenuOpen] = useState(false);
  const [debouncedProductTypeQuery, setDebouncedProductTypeQuery] = useState("");

  useEffect(() => {
    if (activeStoreId) {
      getProductTypesByStoreId(activeStoreId);
    }
  }, [activeStoreId, getProductTypesByStoreId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductTypeQuery(productTypeQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [productTypeQuery]);

  const filteredProductTypes = useMemo(() => {
    const q = debouncedProductTypeQuery.toLowerCase();
    if (!q) return productTypes.slice(0, 10);
    const starts = productTypes.filter((pt) => pt.name.toLowerCase().startsWith(q));
    const includes = productTypes
      .filter((pt) => !pt.name.toLowerCase().startsWith(q) && pt.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q));
    return [...starts, ...includes].slice(0, 10);
  }, [debouncedProductTypeQuery, productTypes]);

  useEffect(() => {
    if (selectedProductTypeId) {
      const selected = productTypes.find((pt) => pt._id === selectedProductTypeId);
      if (selected) {
        setProductTypeQuery(selected.name);
      }
    } else {
      setProductTypeQuery("");
    }
  }, [selectedProductTypeId, productTypes]);

  const handleProductTypeSelect = useCallback(
    (pt: ProductType) => {
      onProductTypeChange(pt._id);
      setProductTypeQuery(pt.name);
      setProductTypeMenuOpen(false);
    },
    [onProductTypeChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductTypeQuery(e.target.value);
      if (!productTypeMenuOpen) setProductTypeMenuOpen(true);
    },
    [productTypeMenuOpen]
  );

  const handleFocus = useCallback(() => {
    setProductTypeMenuOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setProductTypeMenuOpen(false), 150);
  }, []);

  const handleCreateProductType = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      const created = await createProductType({
        storeId: activeStoreId,
        name: debouncedProductTypeQuery,
      });
      handleProductTypeSelect(created);
      toast.success("Product type created");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create product type";
      toast.error(message);
    }
  }, [activeStoreId, debouncedProductTypeQuery, createProductType, handleProductTypeSelect]);

  const queryExists = useMemo(() => {
    return productTypes.some(
      (pt) => pt.name.toLowerCase() === debouncedProductTypeQuery.toLowerCase()
    );
  }, [debouncedProductTypeQuery, productTypes]);

  return (
    <div className="relative">
      <label className={productFormLabelClass(appearance)}>Product type</label>
      <input
        type="text"
        value={productTypeQuery}
        placeholder="Search or create a product type"
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={productFormInputClass(appearance)}
      />
      {productTypeMenuOpen && (
        <ProductTypeMenu
          productTypes={filteredProductTypes}
          debouncedQuery={debouncedProductTypeQuery}
          queryExists={queryExists}
          onProductTypeSelect={handleProductTypeSelect}
          onCreateProductType={handleCreateProductType}
        />
      )}
    </div>
  );
};

export default ProductTypeInput;
