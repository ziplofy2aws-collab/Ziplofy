import {
  CheckIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ProductImagesGalleryProps {
  imageUrls: string[];
  onSave: (payload: { retainedImageUrls: string[]; newImageFiles: File[] }) => Promise<void>;
  isSaving: boolean;
}

const ProductImagesGallery: React.FC<ProductImagesGalleryProps> = ({ imageUrls, onSave, isSaving }) => {
  const urls = Array.isArray(imageUrls) ? imageUrls : [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [retainedImageUrls, setRetainedImageUrls] = useState<string[]>(urls);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [editError, setEditError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [failedRetainedImages, setFailedRetainedImages] = useState<Record<string, boolean>>({});
  const displayImageUrls = isEditing ? retainedImageUrls : urls;

  useEffect(() => {
    if (!isEditing) {
      setRetainedImageUrls(urls);
      setFailedRetainedImages({});
    }
  }, [urls, isEditing]);

  const newImagePreviews = useMemo(
    () =>
      newImageFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [newImageFiles]
  );

  const handleStartEdit = () => {
    setEditError('');
    setRetainedImageUrls(urls);
    setNewImageFiles([]);
    setFailedRetainedImages({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditError('');
    setRetainedImageUrls(urls);
    setNewImageFiles([]);
    setFailedRetainedImages({});
    setIsEditing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setRetainedImageUrls((prev) => prev.filter((url) => url !== imageUrl));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (retainedImageUrls.length + newImageFiles.length === 0) {
      setEditError('At least one product image is required');
      return;
    }
    await onSave({ retainedImageUrls, newImageFiles });
    setEditError('');
    setNewImageFiles([]);
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Media</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {urls.length === 0 ? 'No images uploaded' : `${urls.length} image${urls.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" aria-hidden />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
      {urls.length === 0 && !isEditing ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
            <PhotoIcon className="h-7 w-7 text-gray-300" aria-hidden />
          </div>
          <p className="text-sm font-medium text-gray-700">No product images</p>
          <p className="mt-1 max-w-xs text-xs text-gray-500">Add images when editing this product in your catalog workflow.</p>
        </div>
      ) : (
        <div
          className={`p-5 transition-colors ${
            isEditing && isDragOver ? 'bg-blue-50/50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isEditing ? (
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <PlusIcon className="h-4 w-4" aria-hidden />
                Add images
              </button>
              <p className="mt-2 text-xs text-gray-500">or drag and drop images here</p>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {displayImageUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm ring-1 ring-black/[0.03]"
              >
                <img
                  src={url}
                  alt={`Product ${idx + 1}`}
                  className="block h-full w-full object-contain bg-gray-100"
                  onError={(e) => {
                    setFailedRetainedImages((prev) => ({ ...prev, [url]: true }));
                  }}
                />
                {failedRetainedImages[url] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                    <PhotoIcon className="h-7 w-7 text-gray-300" aria-hidden />
                    <span className="mt-1 text-[11px] font-medium text-gray-500">Preview unavailable</span>
                  </div>
                ) : null}
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white"
                    aria-label="Remove image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
            {isEditing && newImagePreviews.map((preview, idx) => (
              <div
                key={`${preview.file.name}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-blue-200 bg-blue-50/40 shadow-sm ring-1 ring-black/[0.03]"
              >
                <img
                  src={preview.previewUrl}
                  alt={`New upload ${idx + 1}`}
                  className="block h-full w-full object-contain bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white"
                  aria-label="Remove new image"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {isEditing && editError ? (
            <p className="mt-3 text-xs font-medium text-red-600">{editError}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProductImagesGallery;
