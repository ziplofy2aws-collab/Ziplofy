import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ProductNotFound from '../components/ProductNotFound';
import ProductVariantBasicInformation from '../components/ProductVariantBasicInformation';
import ProductVariantDetailsHeader from '../components/ProductVariantDetailsHeader';
import ProductVariantToggleControls from '../components/ProductVariantToggleControls';
import VariantNotFound from '../components/VariantNotFound';
import { useAwsUpload } from '../contexts/aws-upload.context';
import { usePackaging } from '../contexts/packaging.context';
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

const ProductVariantDetailsPage: React.FC = () => {
  const { id, variantId } = useParams();
  const { activeProduct, activeProductLoading, fetchProductById, clearActiveProduct } = useProducts();
  const { activeVariant, activeVariantLoading, fetchProductVariantDetailsById, clearActiveVariant, updateVariant } = useProductVariants();
  const { uploadImageWithSignedUrl, deleteImagesFromS3 } = useAwsUpload();
  const { packagings, loading: packagingsLoading, fetchPackagingsByStoreId } = usePackaging();
  const { activeStoreId } = useStore();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVariantImages, setUploadingVariantImages] = useState(false);
  const [isImageDragOver, setIsImageDragOver] = useState(false);

  const product = useMemo(() => (activeProduct?._id === id ? activeProduct : null), [activeProduct, id]);
  const variant = useMemo(() => {
    if (!activeVariant || !variantId || !id) return null;
    if (activeVariant._id !== variantId) return null;
    if (String(activeVariant.productId) !== String(id)) return null;
    return activeVariant;
  }, [activeVariant, variantId, id]);

  // Segment-based edit states
  const [editingSegments, setEditingSegments] = useState({
    basic: false,
    pricing: false,
    inventory: false,
    package: false,
    images: false
  });
  
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    price: 0,
    compareAtPrice: 0,
    cost: 0,
    chargeTax: false,
    unitPriceTotalAmount: 0,
    unitPriceTotalAmountMetric: 'item',
    unitPriceBaseMeasure: 0,
    unitPriceBaseMeasureMetric: 'item',
    weightValue: 0,
    weightUnit: 'kg',
    countryOfOrigin: '',
    hsCode: '',
    outOfStockContinueSelling: false,
    packageId: '',
    isPhysicalProduct: true,
    isInventoryTrackingEnabled: false,
    images: [] as string[]
  });

  // Unit categories data structure (same as NewProductPage)
  const unitCategories = {
    weight: ['milligram', 'gram', 'kilogram'],
    volume: ['milliliter', 'centiliter', 'liter', 'cubic meter'],
    size: ['millimeter', 'centimeter', 'meter'],
    area: ['square meter'],
    'per item': ['item']
  };

  // Get available base measure units based on selected total amount unit
  const getAvailableBaseMeasureUnits = useCallback(() => {
    if (!formData.unitPriceTotalAmountMetric) return [];
    
    // Find which category the selected unit belongs to
    for (const [category, units] of Object.entries(unitCategories)) {
      if (units.includes(formData.unitPriceTotalAmountMetric)) {
        return units;
      }
    }
    return [];
  }, [formData.unitPriceTotalAmountMetric]);

  // Calculate profit and margin percentage dynamically
  const calculateProfitAndMargin = useCallback(() => {
    const price = formData.price || 0;
    const cost = formData.cost || 0;
    const profit = price - cost;
    const marginPercent = price > 0 ? (profit / price) * 100 : 0;
    
    return {
      profit: profit,
      marginPercent: marginPercent
    };
  }, [formData.price, formData.cost]);

  // Image management functions
  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const handleUploadVariantImages = useCallback(async (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    if (selected.length === 0) return;
    const folderStoreId = activeStoreId || product?.storeId || 'variant';

    try {
      setUploadingVariantImages(true);
      const uploadToast = toast.loading(
        `Uploading ${selected.length} image${selected.length > 1 ? 's' : ''}...`
      );
      const uploaded = await Promise.all(
        selected.map((file) => uploadImageWithSignedUrl(file, { folder: `${folderStoreId}/variant-image` }))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded.map((item) => item.objectUrl)],
      }));
      toast.success('Images uploaded', { id: uploadToast });
    } catch (error: any) {
      const message = error?.message || 'Failed to upload images';
      toast.error(message);
    } finally {
      setUploadingVariantImages(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  }, [activeStoreId, product?.storeId, uploadImageWithSignedUrl]);

  const handleImageDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!editingSegments.images) return;
    event.preventDefault();
    setIsImageDragOver(true);
  }, [editingSegments.images]);

  const handleImageDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!editingSegments.images) return;
    event.preventDefault();
    setIsImageDragOver(false);
  }, [editingSegments.images]);

  const handleImageDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!editingSegments.images) return;
    event.preventDefault();
    setIsImageDragOver(false);
    handleUploadVariantImages(event.dataTransfer.files);
  }, [editingSegments.images, handleUploadVariantImages]);

  // Initialize form data when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        price: variant.price || 0,
        compareAtPrice: variant.compareAtPrice || 0,
        cost: variant.cost || 0,
        chargeTax: variant.chargeTax || false,
        unitPriceTotalAmount: variant.unitPriceTotalAmount || 0,
        unitPriceTotalAmountMetric: variant.unitPriceTotalAmountMetric || 'item',
        unitPriceBaseMeasure: variant.unitPriceBaseMeasure || 0,
        unitPriceBaseMeasureMetric: variant.unitPriceBaseMeasureMetric || 'item',
        weightValue: variant.weightValue || 0,
        weightUnit: variant.weightUnit || 'kg',
        countryOfOrigin: variant.countryOfOrigin || '',
        hsCode: variant.hsCode || '',
        outOfStockContinueSelling: variant.outOfStockContinueSelling || false,
        packageId: variant.package?._id || '',
        isPhysicalProduct: variant.isPhysicalProduct ?? true,
        isInventoryTrackingEnabled: variant.isInventoryTrackingEnabled || false,
        images: variant.images || []
      });
    }
  }, [variant]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset base measure unit when total amount unit changes
      if (field === 'unitPriceTotalAmountMetric') {
        newData.unitPriceBaseMeasureMetric = '';
      }
      
      return newData;
    });
  }, []);

  const handleEditSegment = useCallback((segment: 'basic' | 'pricing' | 'inventory' | 'package' | 'images') => {
    setEditingSegments(prev => ({ ...prev, [segment]: true }));
  }, []);

  const handleSaveSegment = useCallback(async (segment: 'basic' | 'pricing' | 'inventory' | 'package' | 'images') => {
    if (!variant) return;
    
    try {
      // Prepare data based on segment
      let updateData: any = {};
      
      switch (segment) {
        case 'basic':
          updateData = {
            sku: formData.sku,
            barcode: formData.barcode,
            outOfStockContinueSelling: formData.outOfStockContinueSelling
          };
          break;
        case 'pricing':
          const { profit, marginPercent } = calculateProfitAndMargin();
          updateData = {
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            cost: formData.cost,
            profit: profit,
            marginPercent: marginPercent,
            unitPriceTotalAmount: formData.unitPriceTotalAmount,
            unitPriceTotalAmountMetric: formData.unitPriceTotalAmountMetric,
            unitPriceBaseMeasure: formData.unitPriceBaseMeasure,
            unitPriceBaseMeasureMetric: formData.unitPriceBaseMeasureMetric,
            chargeTax: formData.chargeTax
          };
          break;
        case 'package':
          updateData = {
            package: formData.packageId || null,
            countryOfOrigin: formData.countryOfOrigin,
            hsCode: formData.hsCode,
            weightValue: formData.weightValue,
            weightUnit: formData.weightUnit
          };
          break;
        case 'images':
          updateData = {
            images: formData.images.filter(img => img.trim() !== '') // Remove empty URLs
          };
          break;
      }

      if (segment === 'images') {
        const existingImages = Array.isArray(variant.images) ? variant.images : [];
        const nextImages = Array.isArray(updateData.images) ? updateData.images : [];
        const removedImageUrls = existingImages.filter((img) => !nextImages.includes(img));
        if (removedImageUrls.length > 0) {
          const deleteToast = toast.loading(
            `Deleting ${removedImageUrls.length} image${removedImageUrls.length > 1 ? 's' : ''}...`
          );
          const removedImageKeys = removedImageUrls
            .map((url) => extractS3KeyFromUrl(url))
            .filter((key): key is string => Boolean(key));
          await deleteImagesFromS3({
            imageUrls: removedImageUrls,
            imageKeys: removedImageKeys,
          });
          toast.success('Removed images deleted', { id: deleteToast });
        }
      }
      
      await updateVariant(variant._id, updateData);
      setEditingSegments(prev => ({ ...prev, [segment]: false }));
      if (segment === 'images') {
        toast.success('Media updated');
      }
    } catch (error) {
      console.error('Error updating variant:', error);
      const message = (error as any)?.message || 'Failed to update variant';
      toast.error(message);
    }
  }, [variant, formData, calculateProfitAndMargin, deleteImagesFromS3, updateVariant]);

  const handleCancelSegment = useCallback((segment: 'basic' | 'pricing' | 'inventory' | 'package' | 'images') => {
    // Reset form data to original variant data
    if (variant) {
      setFormData({
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        price: variant.price || 0,
        compareAtPrice: variant.compareAtPrice || 0,
        cost: variant.cost || 0,
        chargeTax: variant.chargeTax || false,
        unitPriceTotalAmount: variant.unitPriceTotalAmount || 0,
        unitPriceTotalAmountMetric: variant.unitPriceTotalAmountMetric || 'item',
        unitPriceBaseMeasure: variant.unitPriceBaseMeasure || 0,
        unitPriceBaseMeasureMetric: variant.unitPriceBaseMeasureMetric || 'item',
        weightValue: variant.weightValue || 0,
        weightUnit: variant.weightUnit || 'kg',
        countryOfOrigin: variant.countryOfOrigin || '',
        hsCode: variant.hsCode || '',
        outOfStockContinueSelling: variant.outOfStockContinueSelling || false,
        packageId: variant.package?._id || '',
        isPhysicalProduct: variant.isPhysicalProduct ?? true,
        isInventoryTrackingEnabled: variant.isInventoryTrackingEnabled || false,
        images: variant.images || []
      });
    }
    setEditingSegments(prev => ({ ...prev, [segment]: false }));
  }, [variant]);

  const handleSaveToggleChanges = useCallback(async () => {
    if (!variant) return;
    try {
      await updateVariant(variant._id, {
        isPhysicalProduct: formData.isPhysicalProduct,
        isInventoryTrackingEnabled: formData.isInventoryTrackingEnabled
      });
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  }, [variant, formData.isPhysicalProduct, formData.isInventoryTrackingEnabled, updateVariant]);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id).catch(() => {
      // handled by page not-found state
    });
    return () => {
      clearActiveProduct();
    };
  }, [id, fetchProductById, clearActiveProduct]);

  useEffect(() => {
    if (!variantId) return;
    fetchProductVariantDetailsById(variantId, id).catch(() => {
      // handled by page not-found state
    });
    return () => {
      clearActiveVariant();
    };
  }, [variantId, id, fetchProductVariantDetailsById, clearActiveVariant]);

  useEffect(() => {
    if (activeStoreId) {
      fetchPackagingsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchPackagingsByStoreId]);

  if (activeProductLoading || activeVariantLoading) {
    return null;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  if (!variant) {
    return <VariantNotFound productId={id} />;
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <ProductVariantDetailsHeader
          product={product}
          variant={variant}
          productId={id || ''}
        />

        {/* Toggle Controls */}
        <ProductVariantToggleControls
          isPhysicalProduct={formData.isPhysicalProduct}
          isInventoryTrackingEnabled={formData.isInventoryTrackingEnabled}
          onIsPhysicalProductChange={(value) => handleInputChange('isPhysicalProduct', value)}
          onIsInventoryTrackingEnabledChange={(value) => handleInputChange('isInventoryTrackingEnabled', value)}
          onSaveChanges={handleSaveToggleChanges}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6 xl:col-span-2">
            {/* Basic Variant Information */}
            <ProductVariantBasicInformation
              variant={variant}
              formData={{
                sku: formData.sku,
                barcode: formData.barcode,
                outOfStockContinueSelling: formData.outOfStockContinueSelling,
              }}
              isEditing={editingSegments.basic}
              onEdit={() => handleEditSegment('basic')}
              onSave={() => handleSaveSegment('basic')}
              onCancel={() => handleCancelSegment('basic')}
              onInputChange={handleInputChange}
            />

            {/* Pricing Information */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Pricing</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Price, cost, and margin</p>
                </div>
                {!editingSegments.pricing ? (
                  <button
                    onClick={() => handleEditSegment('pricing')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveSegment('pricing')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelSegment('pricing')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Selling Price
                  </p>
                  {editingSegments.pricing ? (
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.price.toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Compare At Price
                  </p>
                  {editingSegments.pricing ? (
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                        value={formData.compareAtPrice}
                        onChange={(e) => handleInputChange('compareAtPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.compareAtPrice?.toFixed(2) || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Cost
                  </p>
                  {editingSegments.pricing ? (
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.cost?.toFixed(2) || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Profit
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    ${editingSegments.pricing ? calculateProfitAndMargin().profit.toFixed(2) : (variant.profit?.toFixed(2) || 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Margin Percentage
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {editingSegments.pricing ? calculateProfitAndMargin().marginPercent.toFixed(2) : (variant.marginPercent?.toFixed(2) || '0.00')}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Unit Price Total Amount
                  </p>
                  {editingSegments.pricing ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                          value={formData.unitPriceTotalAmount}
                          onChange={(e) => handleInputChange('unitPriceTotalAmount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <select
                        className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors min-w-[120px]"
                        value={formData.unitPriceTotalAmountMetric}
                        onChange={(e) => handleInputChange('unitPriceTotalAmountMetric', e.target.value)}
                      >
                        <option value="" disabled>Select unit</option>
                        {Object.entries(unitCategories).map(([category, units]) => (
                          <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                            {units.map(unit => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      ${variant.unitPriceTotalAmount?.toFixed(2) || 'N/A'} per {variant.unitPriceTotalAmountMetric || 'item'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Unit Price Base Measure
                  </p>
                  {editingSegments.pricing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                        value={formData.unitPriceBaseMeasure}
                        onChange={(e) => handleInputChange('unitPriceBaseMeasure', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors min-w-[120px] disabled:bg-gray-50 disabled:cursor-not-allowed"
                        value={formData.unitPriceBaseMeasureMetric}
                        onChange={(e) => handleInputChange('unitPriceBaseMeasureMetric', e.target.value)}
                        disabled={!formData.unitPriceTotalAmountMetric}
                      >
                        <option value="" disabled>
                          {!formData.unitPriceTotalAmountMetric ? 'Select total unit first' : 'Select unit'}
                        </option>
                        {getAvailableBaseMeasureUnits().map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.unitPriceBaseMeasure || 'N/A'} {variant.unitPriceBaseMeasureMetric || 'item'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Charge Tax
                  </p>
                  {editingSegments.pricing ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative inline-block w-10 h-5">
                        <input
                          type="checkbox"
                          checked={formData.chargeTax}
                          onChange={(e) => handleInputChange('chargeTax', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900"></div>
                      </div>
                      <span className="text-sm text-gray-900">{formData.chargeTax ? 'Yes' : 'No'}</span>
                    </label>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.chargeTax ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory & Status */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Inventory & Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Inventory Tracking
                  </p>
                  <p className="text-sm text-gray-900">
                    {variant.isInventoryTrackingEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Artificial Variant
                  </p>
                  <p className="text-sm text-gray-900">
                    {variant.isSynthetic ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Option Values */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Option Values
              </h2>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(variant.optionValues || {}).map(([key, value]) => (
                  <span
                    key={`${key}-${value}`}
                    className="px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-700"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Media</h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {(variant.images?.length || 0)} image{(variant.images?.length || 0) === 1 ? '' : 's'}
                  </p>
                </div>
                {!editingSegments.images ? (
                  <button
                    onClick={() => handleEditSegment('images')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveSegment('images')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelSegment('images')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {editingSegments.images ? (
                <div
                  className={`rounded-xl transition-colors ${
                    isImageDragOver ? 'bg-blue-50/60' : ''
                  }`}
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  onDrop={handleImageDrop}
                >
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUploadVariantImages(e.target.files)}
                  />
                  {/* Upload Image Button */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      disabled={uploadingVariantImages}
                      className="border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {uploadingVariantImages ? 'Uploading...' : 'Upload images'}
                    </button>
                  </div>
                  <p className="mb-4 text-xs text-gray-500">or drag and drop images here</p>
                  
                  {/* Image tiles */}
                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {formData.images.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm ring-1 ring-black/[0.03]"
                        >
                          <img
                            src={imageUrl}
                            alt={`Variant image ${index + 1}`}
                            className="block h-full w-full object-cover"
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white"
                            aria-label="Remove image"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-600">
                        No images added yet. Click "Upload images" to get started.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* View Mode */
                <div>
                  {variant.images && variant.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {variant.images.map((image, index) => (
                        <div key={index}>
                          <img
                            src={image}
                            alt={`Variant image ${index + 1}`}
                            className="w-full h-40 object-cover rounded border border-gray-200"
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-600">
                        No images for this variant yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Information (shown only for physical products) */}
            {formData.isPhysicalProduct && (
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Shipping</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Physical product fulfillment</p>
                </div>
                {!editingSegments.package ? (
                  <button
                    onClick={() => handleEditSegment('package')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveSegment('package')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelSegment('package')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Package
                  </p>
                  {editingSegments.package ? (
                    <select
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      value={formData.packageId || variant.package?._id || ''}
                      onChange={(e) => handleInputChange('packageId', e.target.value)}
                    >
                      <option value="">No Package</option>
                      {packagings.map((pkg) => (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.packageName} ({pkg.packageType}) - {pkg.length}×{pkg.width}×{pkg.height} {pkg.dimensionsUnit}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.package ? `${variant.package.packageName} (${variant.package.packageType}) - ${variant.package.length}×${variant.package.width}×${variant.package.height} ${variant.package.dimensionsUnit}` : 'No Package'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Country of Origin
                  </p>
                  {editingSegments.package ? (
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      value={formData.countryOfOrigin}
                      onChange={(e) => handleInputChange('countryOfOrigin', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.countryOfOrigin || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    HS Code
                  </p>
                  {editingSegments.package ? (
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      value={formData.hsCode}
                      onChange={(e) => handleInputChange('hsCode', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.hsCode || 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Product Weight
                  </p>
                  {editingSegments.package ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                        value={formData.weightValue}
                        onChange={(e) => handleInputChange('weightValue', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors min-w-[80px]"
                        value={formData.weightUnit}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {variant.weightValue} {variant.weightUnit}
                    </p>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-6 xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Variant ID & References
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Variant ID
                  </p>
                  <p className="text-xs font-mono text-gray-900">
                    {variant._id}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Product ID
                  </p>
                  <p className="text-xs font-mono text-gray-900">
                    {variant.productId}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Status & Flags
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Inventory Tracking
                  </p>
                  <p className="text-sm text-gray-900">
                    {variant.isInventoryTrackingEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Artificial Variant
                  </p>
                  <p className="text-sm text-gray-900">
                    {variant.isSynthetic ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Charge Tax
                  </p>
                  <p className="text-sm text-gray-900">
                    {variant.chargeTax ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Financial Summary
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Selling Price
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    ${variant.price.toFixed(2)}
                  </p>
                </div>
                
                {variant.compareAtPrice && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      Compare At Price
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.compareAtPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {variant.cost && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      Cost
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.cost.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {variant.profit && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      Profit
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ${variant.profit.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {variant.marginPercent && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      Margin
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {variant.marginPercent.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Timeline
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Created
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(variant.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(variant.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1.5">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(variant.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(variant.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductVariantDetailsPage;
