import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Modal from '../Modal';
import ProductDescriptionInput from '../products/ProductDescriptionInput';
import { useAwsUpload } from '../../contexts/aws-upload.context';

interface EditCollectionForm {
  title: string;
  imageUrl: string;
  imageAltText: string;
  description: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  status: 'draft' | 'published';
}

interface EditCollectionModalProps {
  isOpen: boolean;
  formData: EditCollectionForm;
  onChange: (field: keyof EditCollectionForm, value: string | 'draft' | 'published') => void;
  onClose: () => void;
  onUpdate: () => void;
  hasChanges?: boolean;
}

const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
  isOpen,
  formData,
  onChange,
  onClose,
  onUpdate,
  hasChanges = true,
}) => {
  const { uploadImageWithSignedUrl, loading: awsUploading } = useAwsUpload();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit collection"
      maxWidth="lg"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUpdate}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Update
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Title
          </label>
          <input
            id="edit-title"
            type="text"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Collection image</label>
          {formData.imageUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={formData.imageUrl} alt="Collection" className="h-40 w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('imageUrl', '')}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
                aria-label="Remove collection image"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 py-7 text-center hover:border-blue-300 hover:bg-blue-50/30">
              <PhotoIcon className="h-7 w-7 text-gray-400" />
              <span className="mt-2 text-sm font-medium text-gray-700">
                {awsUploading ? 'Uploading image...' : 'Upload collection image'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = '';
                  if (!file) return;
                  try {
                    const uploaded = await uploadImageWithSignedUrl(file, { folder: 'collections' });
                    onChange('imageUrl', uploaded.objectUrl);
                  } catch {
                    // upload errors are handled in context
                  }
                }}
              />
            </label>
          )}
        </div>
        <div>
          <label htmlFor="edit-image-alt" className="block text-sm font-medium text-gray-700 mb-1.5">
            Image alt text
          </label>
          <input
            id="edit-image-alt"
            type="text"
            value={formData.imageAltText}
            onChange={(e) => onChange('imageAltText', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
            placeholder="Describe this image"
          />
        </div>
        <div>
          <ProductDescriptionInput
            value={formData.description}
            onChange={(html) => onChange('description', html)}
            placeholder="Description for customers"
          />
        </div>
        <div>
          <label
            htmlFor="edit-page-title"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Page title
          </label>
          <input
            id="edit-page-title"
            type="text"
            value={formData.pageTitle}
            onChange={(e) => onChange('pageTitle', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="edit-meta-description"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Meta description
          </label>
          <textarea
            id="edit-meta-description"
            value={formData.metaDescription}
            onChange={(e) => onChange('metaDescription', e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors resize-none"
          />
        </div>
        <div>
          <label htmlFor="edit-url-handle" className="block text-sm font-medium text-gray-700 mb-1.5">
            URL handle
          </label>
          <input
            id="edit-url-handle"
            type="text"
            value={formData.urlHandle}
            onChange={(e) => onChange('urlHandle', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            id="edit-status"
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as 'draft' | 'published')}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none transition-colors bg-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default EditCollectionModal;
