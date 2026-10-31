import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useStore } from '../../contexts/store.context';
import { SelectImageModal, type SelectedImageAsset } from '../SelectImageModal';

type CollectionCoverImageFieldProps = {
  imageUrl: string;
  imageAlt?: string;
  onImageUrlChange: (url: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

const CollectionCoverImageField: React.FC<CollectionCoverImageFieldProps> = ({
  imageUrl,
  imageAlt = 'Collection',
  onImageUrlChange,
  disabled = false,
  compact = false,
}) => {
  const { activeStoreId } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = useCallback(() => {
    if (disabled) return;
    if (!activeStoreId) {
      toast.error('Select a store before choosing files');
      return;
    }
    setPickerOpen(true);
  }, [activeStoreId, disabled]);

  const handleSelect = useCallback(
    (asset: SelectedImageAsset) => {
      onImageUrlChange(asset.url);
      setPickerOpen(false);
    },
    [onImageUrlChange]
  );

  const previewHeight = compact ? 'h-40' : 'h-44';

  return (
    <>
      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg border border-gray-200/70 bg-gray-50">
            <img src={imageUrl} alt={imageAlt} className={`${previewHeight} w-full object-cover`} />
            <button
              type="button"
              onClick={() => onImageUrlChange('')}
              disabled={disabled}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80 disabled:opacity-50"
              aria-label="Remove collection image"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Select
          </button>
          <p className="text-[12px] text-gray-400">
            Removing the image here does not delete the file from Content → Files.
          </p>
        </div>
      ) : (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center">
          <PhotoIcon className="h-8 w-8 text-gray-400" />
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Select
          </button>
          <p className="mt-2 max-w-xs text-xs text-gray-500">Choose an image from your store files.</p>
        </div>
      )}

      <SelectImageModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        initialUrl={imageUrl}
      />
    </>
  );
};

export default CollectionCoverImageField;
