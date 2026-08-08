import { PencilIcon } from '@heroicons/react/24/outline';
import { adminListCardClass } from './admin-list-ui';

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
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-semibold text-admin-text">Store details</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Basic information used across your admin and storefront.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-medium text-admin-text-subdued">Store profile</p>
          <button
            onClick={onEditProfile}
            className="rounded-lg p-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
            aria-label="Edit profile"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-1 text-[13px] font-medium text-admin-text">
          {settings?.storeName || activeStore?.storeName || 'My Store'}
        </p>
        <p className="mb-1 text-[12px] text-admin-text-secondary">
          {settings?.storeEmail || loggedInUser?.email || 'developer200419@gmail.com'}
        </p>
        <p className="text-[12px] text-admin-text-secondary">
          {settings?.storePhone && settings.storePhone.trim()
            ? settings.storePhone
            : info?.contactInfo && info.contactInfo.trim()
              ? info.contactInfo
              : 'No phone number'}
        </p>
      </div>

      <hr className="my-4 border-admin-divider" />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-medium text-admin-text-subdued">Billing address</p>
          <button
            onClick={onEditBilling}
            className="rounded-lg p-2 text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
            aria-label="Edit billing address"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[13px] font-medium text-admin-text">{billingAddress?.country || 'India'}</p>
      </div>
    </div>
  );
}
