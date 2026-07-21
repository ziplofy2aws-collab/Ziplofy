import React from 'react';
import Modal from '../Modal';
import ProductDescriptionInput from '../products/ProductDescriptionInput';
import CollectionCoverImageField from './CollectionCoverImageField';

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
          <CollectionCoverImageField
            imageUrl={formData.imageUrl}
            imageAlt={formData.imageAltText || formData.title || 'Collection'}
            onImageUrlChange={(url) => onChange('imageUrl', url)}
            compact
          />
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
