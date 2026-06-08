import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import ProductTagsMenu from "./ProductTagsMenu";
import { useProductTags } from "../../contexts/product-tags.context";

interface ProductTagsInputProps {
  selectedTags: string[];
  activeStoreId: string | null;
  onTagsChange: (tags: string[]) => void;
}

const ProductTagsInput: React.FC<ProductTagsInputProps> = ({
  selectedTags,
  activeStoreId,
  onTagsChange,
}) => {
  const { productTags, fetchProductTags, addProductTag } = useProductTags();
  
  const [productTagsQuery, setProductTagsQuery] = useState("");
  const [productTagsMenuOpen, setProductTagsMenuOpen] = useState(false);
  const [debouncedProductTagsQuery, setDebouncedProductTagsQuery] = useState("");

  // Fetch product tags when activeStoreId changes
  useEffect(() => {
    if (activeStoreId) {
      fetchProductTags(activeStoreId);
    }
  }, [activeStoreId, fetchProductTags]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductTagsQuery(productTagsQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [productTagsQuery]);

  // Filtered product tags
  const filteredProductTags = useMemo(() => {
    const q = debouncedProductTagsQuery.toLowerCase();
    if (!q) return productTags.slice(0, 10);
    const starts = productTags.filter(tag => tag.name.toLowerCase().startsWith(q));
    const includes = productTags.filter(tag => !tag.name.toLowerCase().startsWith(q) && tag.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q));
    return [...starts, ...includes].slice(0, 10);
  }, [debouncedProductTagsQuery, productTags]);

  const handleTagSelect = useCallback((tagId: string) => {
    if (selectedTags.includes(tagId)) {
      // If already selected, remove it (deselect)
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      // If not selected, add it (select)
      onTagsChange([...selectedTags, tagId]);
    }
    setProductTagsQuery("");
    setProductTagsMenuOpen(true);
  }, [selectedTags, onTagsChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProductTagsQuery(e.target.value);
    if (!productTagsMenuOpen) setProductTagsMenuOpen(true);
  }, [productTagsMenuOpen]);

  const handleFocus = useCallback(() => {
    setProductTagsMenuOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setProductTagsMenuOpen(false), 150);
  }, []);

  const handleCreateTag = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      const created = await addProductTag(activeStoreId, debouncedProductTagsQuery);
      handleTagSelect(created._id);
      toast.success("Product tag created");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create product tag";
      toast.error(message);
    }
  }, [activeStoreId, debouncedProductTagsQuery, addProductTag, handleTagSelect]);

  const queryExists = useMemo(() => {
    return productTags.some(t => t.name.toLowerCase() === debouncedProductTagsQuery.toLowerCase());
  }, [debouncedProductTagsQuery, productTags]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Tags
      </label>
      <input
        type="text"
        value={productTagsQuery}
        placeholder="Search or create tags"
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
      {selectedTags.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">{selectedTags.length} selected</p>
      )}
      {productTagsMenuOpen && (
        <ProductTagsMenu
          tags={filteredProductTags}
          selectedTags={selectedTags}
          debouncedQuery={debouncedProductTagsQuery}
          queryExists={queryExists}
          onTagSelect={handleTagSelect}
          onCreateTag={handleCreateTag}
        />
      )}
    </div>
  );
};

export default ProductTagsInput;

