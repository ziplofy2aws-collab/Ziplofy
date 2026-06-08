import { CheckIcon, PencilSquareIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import AddPackageModal from './AddPackageModal';
import { useCountries } from '../contexts/country.context';
import { usePackaging } from '../contexts/packaging.context';
import { Product } from '../contexts/product.context';

interface ProductShippingInformationProps {
  product: Product;
  activeStoreId: string | null;
  onSave: (payload: {
    package?: string;
    productWeight?: number;
    productWeightUnit?: string;
    countryOfOrigin?: string;
    harmonizedSystemCode?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const ProductShippingInformation: React.FC<ProductShippingInformationProps> = ({
  product,
  activeStoreId,
  onSave,
  isSaving,
}) => {
  const { packagings, fetchPackagingsByStoreId, createPackaging } = usePackaging();
  const { countries, getCountries } = useCountries();
  const [isEditing, setIsEditing] = useState(false);
  const [draftPackage, setDraftPackage] = useState(product.package?._id || '');
  const [draftProductWeight, setDraftProductWeight] = useState(
    product.productWeight != null ? String(product.productWeight) : ''
  );
  const [draftProductWeightUnit, setDraftProductWeightUnit] = useState(product.productWeightUnit || 'kg');
  const [draftCountryOfOrigin, setDraftCountryOfOrigin] = useState(product.countryOfOrigin || '');
  const [draftHsCode, setDraftHsCode] = useState(product.harmonizedSystemCode || '');
  const [editError, setEditError] = useState('');
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [packageFormData, setPackageFormData] = useState({
    packageName: '',
    packageType: 'box',
    length: '',
    width: '',
    height: '',
    dimensionsUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    isDefault: false,
  });

  if (!product.isPhysicalProduct) {
    return null;
  }

  useEffect(() => {
    if (activeStoreId) {
      fetchPackagingsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchPackagingsByStoreId]);

  useEffect(() => {
    if (isEditing) {
      getCountries({ limit: 1000 }).catch(() => {
        // error already handled in context; keep editor usable
      });
    }
  }, [isEditing, getCountries]);

  useEffect(() => {
    if (!isEditing) {
      setDraftPackage(product.package?._id || '');
      setDraftProductWeight(product.productWeight != null ? String(product.productWeight) : '');
      setDraftProductWeightUnit(product.productWeightUnit || 'kg');
      setDraftCountryOfOrigin(product.countryOfOrigin || '');
      setDraftHsCode(product.harmonizedSystemCode || '');
    }
  }, [
    isEditing,
    product.package?._id,
    product.productWeight,
    product.productWeightUnit,
    product.countryOfOrigin,
    product.harmonizedSystemCode,
  ]);

  const startEditing = () => {
    setEditError('');
    setDraftPackage(product.package?._id || '');
    setDraftProductWeight(product.productWeight != null ? String(product.productWeight) : '');
    setDraftProductWeightUnit(product.productWeightUnit || 'kg');
    setDraftCountryOfOrigin(product.countryOfOrigin || '');
    setDraftHsCode(product.harmonizedSystemCode || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const parsedWeight = draftProductWeight.trim() === '' ? undefined : Number(draftProductWeight);
    const normalizedHsCode = draftHsCode.trim();
    if (parsedWeight !== undefined && (Number.isNaN(parsedWeight) || parsedWeight < 0)) {
      setEditError('Weight must be a valid non-negative number');
      return;
    }
    if (normalizedHsCode && !/^\d{6}$/.test(normalizedHsCode)) {
      setEditError('HS code must be exactly 6 digits');
      return;
    }
    await onSave({
      package: draftPackage || undefined,
      productWeight: parsedWeight,
      productWeightUnit: parsedWeight !== undefined ? draftProductWeightUnit : undefined,
      countryOfOrigin: draftCountryOfOrigin.trim() || undefined,
      harmonizedSystemCode: normalizedHsCode || undefined,
    });
    setEditError('');
    setIsEditing(false);
  };

  const handleOpenAddPackageModal = () => {
    setPackageFormData({
      packageName: '',
      packageType: 'box',
      length: '',
      width: '',
      height: '',
      dimensionsUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      isDefault: false,
    });
    setIsAddPackageModalOpen(true);
  };

  const handleCloseAddPackageModal = () => {
    setIsAddPackageModalOpen(false);
  };

  const handlePackageFormChange = (field: string, value: any) => {
    setPackageFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPackageSubmit = async () => {
    if (!activeStoreId) {
      toast.error('Please select a store first');
      return;
    }

    const payload = {
      storeId: activeStoreId,
      packageName: packageFormData.packageName.trim(),
      packageType: packageFormData.packageType as 'box' | 'envelope' | 'soft_package',
      length: parseFloat(packageFormData.length),
      width: parseFloat(packageFormData.width),
      height: packageFormData.packageType === 'envelope' ? 0 : parseFloat(packageFormData.height),
      dimensionsUnit: packageFormData.dimensionsUnit as 'cm' | 'in',
      weight: parseFloat(packageFormData.weight),
      weightUnit: packageFormData.weightUnit as 'g' | 'kg' | 'oz' | 'lb',
      isDefault: packageFormData.isDefault,
    };

    if (
      !payload.packageName ||
      Number.isNaN(payload.length) ||
      Number.isNaN(payload.width) ||
      Number.isNaN(payload.weight) ||
      (payload.packageType !== 'envelope' && Number.isNaN(payload.height))
    ) {
      toast.error('Please fill all required package details');
      return;
    }

    try {
      await createPackaging(payload);
      await fetchPackagingsByStoreId(activeStoreId);
      setIsAddPackageModalOpen(false);
      toast.success('Package added');
    } catch (error) {
      toast.error('Failed to add package');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <TruckIcon className="h-4 w-4 text-blue-600" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Shipping</h2>
          <p className="text-xs text-gray-500">Physical product fulfillment</p>
        </div>
        <div className="ml-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
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
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Package</p>
          {isEditing ? (
            <>
              <select
                value={draftPackage}
                onChange={(e) => setDraftPackage(e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="">Select package</option>
                {packagings.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.packageName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleOpenAddPackageModal}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                + Add package
              </button>
            </>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">{product.package?.packageName || '—'}</p>
          )}
          {!isEditing && product.package ? (
            <p className="mt-1 text-xs text-gray-500">
              {product.package.length} × {product.package.width} × {product.package.height}{' '}
              {product.package.dimensionsUnit}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Weight</p>
          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftProductWeight}
                onChange={(e) => setDraftProductWeight(e.target.value)}
                className="w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="0.00"
              />
              <select
                value={draftProductWeightUnit}
                onChange={(e) => setDraftProductWeightUnit(e.target.value)}
                className="rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
                <option value="ton">ton</option>
              </select>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {product.productWeight ?? '—'} {product.productWeightUnit ?? ''}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Origin</p>
          {isEditing ? (
            <select
              value={draftCountryOfOrigin}
              onChange={(e) => setDraftCountryOfOrigin(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country._id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">{product.countryOfOrigin || '—'}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">HS code</p>
          {isEditing ? (
            <input
              type="text"
              value={draftHsCode}
              onChange={(e) => setDraftHsCode(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 font-mono text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              maxLength={6}
              inputMode="numeric"
              placeholder="6-digit HS code"
            />
          ) : (
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
              {product.harmonizedSystemCode || '—'}
            </p>
          )}
        </div>
      </div>
      {isEditing && editError ? (
        <p className="px-5 pb-4 text-xs font-medium text-red-600">{editError}</p>
      ) : null}
      <AddPackageModal
        open={isAddPackageModalOpen}
        onClose={handleCloseAddPackageModal}
        formData={packageFormData}
        onFormChange={handlePackageFormChange}
        onSubmit={handleAddPackageSubmit}
      />
    </div>
  );
};

export default ProductShippingInformation;
