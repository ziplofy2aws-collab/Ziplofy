import { PencilIcon } from '@heroicons/react/24/outline';

interface StoreDetailsSectionProps {
  settings?: {
    storeName?: string;
    storeEmail?: string;
    storePhone?: string;
  } | null;
  activeStore?: {
    storeName?: string;
  } | null;
  loggedInUser?: {
    email?: string;
  } | null;
  info?: {
    contactInfo?: string;
  } | null;
  billingAddress?: {
    country?: string;
  } | null;
  onEditProfile: () => void;
  onEditBilling: () => void;
}

export default function StoreDetailsSection({
  settings,
  activeStore,
  loggedInUser,
  info,
  billingAddress,
  onEditProfile,
  onEditBilling,
}: StoreDetailsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Store details</h2>
          <p className="mt-1 text-sm text-gray-500">Basic information used across your admin and storefront.</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">Store profile</p>
          <button
            onClick={onEditProfile}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Edit profile"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          {settings?.storeName || activeStore?.storeName || 'My Store'}
        </p>
        <p className="text-xs text-gray-600 mb-1">
          {settings?.storeEmail || loggedInUser?.email || 'developer200419@gmail.com'}
        </p>
        <p className="text-xs text-gray-600">
          {settings?.storePhone && settings.storePhone.trim() 
            ? settings.storePhone 
            : (info?.contactInfo && info.contactInfo.trim() ? info.contactInfo : 'No phone number')}
        </p>
      </div>

      <hr className="my-4 border-gray-100" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">Billing address</p>
          <button
            onClick={onEditBilling}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Edit billing address"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-gray-900">
          {billingAddress?.country || 'India'}
        </p>
      </div>
    </div>
  );
}

