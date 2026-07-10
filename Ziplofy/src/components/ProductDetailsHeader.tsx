import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  CubeIcon,
  HomeIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../contexts/product.context';
import ProductDescriptionInput from './products/ProductDescriptionInput';

interface ProductDetailsHeaderProps {
  product: Product;
  variantsCount: number;
  onDeleteProduct: () => void;
  onUndeleteProduct: () => void;
  onSaveBasicInfo: (payload: { title: string; description: string }) => Promise<void>;
  isSavingBasicInfo: boolean;
}

const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({
  product,
  variantsCount,
  onDeleteProduct,
  onUndeleteProduct,
  onSaveBasicInfo,
  isSavingBasicInfo,
}) => {
  const navigate = useNavigate();
  const title = product.title || 'Untitled product';
  const descriptionPreview = product.description || '';
  const descriptionPlainText = product.description
    ? product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(product.description || '');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!isEditingBasicInfo) {
      setDraftTitle(title);
      setDraftDescription(product.description || '');
    }
  }, [title, product.description, isEditingBasicInfo]);

  useEffect(() => {
    if (!isEditingBasicInfo) {
      setIsDescriptionExpanded(false);
    }
  }, [isEditingBasicInfo, product.description]);

  const handleStartEdit = () => {
    setEditError('');
    setDraftTitle(title);
    setDraftDescription(product.description || '');
    setIsEditingBasicInfo(true);
  };

  const handleCancelEdit = () => {
    setEditError('');
    setDraftTitle(title);
    setDraftDescription(product.description || '');
    setIsEditingBasicInfo(false);
  };

  const handleSaveBasicInfo = async () => {
    if (!draftTitle.trim()) {
      setEditError('Title is required');
      return;
    }
    await onSaveBasicInfo({
      title: draftTitle.trim(),
      description: draftDescription,
    });
    setEditError('');
    setIsEditingBasicInfo(false);
  };

  return (
    <header className="mb-8 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Products
        </button>
        {product.isDeleted ? (
          <button
            type="button"
            onClick={onUndeleteProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100"
          >
            Un-delete product
          </button>
        ) : (
          <button
            type="button"
            onClick={onDeleteProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100"
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
            Delete product
          </button>
        )}
      </div>

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <HomeIcon className="h-3.5 w-3.5" aria-hidden />
          Catalog
        </button>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
        <span className="rounded-lg bg-gray-100/80 px-2 py-1 font-semibold text-gray-900" aria-current="page">
          {title}
        </span>
      </nav>

      <div className="rounded-2xl border border-gray-200/80 bg-linear-to-b from-white to-blue-50/25 p-5 shadow-sm sm:p-6">
        <div className="min-w-0 border-l-4 border-blue-500/70 pl-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
              {!isEditingBasicInfo ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSavingBasicInfo}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBasicInfo}
                    disabled={isSavingBasicInfo}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" aria-hidden />
                    {isSavingBasicInfo ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            {isEditingBasicInfo ? (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full max-w-3xl px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Enter product title"
                  />
                </div>
                <ProductDescriptionInput
                  value={draftDescription}
                  onChange={setDraftDescription}
                  placeholder="Describe your product..."
                />
                {editError ? <p className="text-xs text-red-600">{editError}</p> : null}
              </div>
            ) : descriptionPreview ? (
              <div className="mt-3 max-w-4xl">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsDescriptionExpanded((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsDescriptionExpanded((v) => !v);
                    }
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200/80 bg-white/80 p-3 text-gray-700 shadow-sm transition-colors hover:border-gray-300 ${
                    isDescriptionExpanded ? '' : 'max-h-40'
                  }`}
                >
                  <div
                    className="prose prose-sm max-w-none
                      [&_h1]:my-2 [&_h1]:text-2xl [&_h1]:font-semibold
                      [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold
                      [&_h3]:my-1.5 [&_h3]:text-lg [&_h3]:font-semibold
                      [&_p]:my-1.5 [&_p]:leading-relaxed
                      [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
                      [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
                      [&_img]:my-2 [&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-gray-200
                      [&_iframe]:my-2 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-md [&_iframe]:border [&_iframe]:border-gray-200"
                    dangerouslySetInnerHTML={{ __html: descriptionPreview }}
                  />
                  {!isDescriptionExpanded ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white/95 to-transparent" />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((v) => !v)}
                  className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show full description'}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                {descriptionPlainText ? descriptionPlainText : 'No description'}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  product.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {product.status === 'active' ? 'Active' : product.status || 'Draft'}
              </span>
              {product.isDeleted ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                  Deleted
                </span>
              ) : null}
              {product.onlineStorePublishing ? (
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  Online store
                </span>
              ) : null}
              {product.pointOfSalePublishing ? (
                <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  Point of sale
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                <Squares2X2Icon className="h-3.5 w-3.5" aria-hidden />
                {variantsCount} {variantsCount === 1 ? 'variant' : 'variants'}
              </span>
              {product.sku ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-xs font-medium text-gray-700">
                  <CubeIcon className="h-3.5 w-3.5" aria-hidden />
                  {product.sku}
                </span>
              ) : null}
            </div>
        </div>
      </div>

    </header>
  );
};

export default ProductDetailsHeader;
