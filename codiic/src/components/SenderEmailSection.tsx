import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useStoreNotificationEmail } from '../contexts/store-notification-email.context';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'zoho.com',
]);

function isPublicEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.trim().toLowerCase();
  return domain ? PUBLIC_EMAIL_DOMAINS.has(domain) : false;
}

function getRelayEmail(storeId: string): string {
  const suffix = storeId.replace(/[^a-f0-9]/gi, '').slice(-12) || 'store';
  return `store+${suffix}@codiicemail.com`;
}

interface SenderEmailSectionProps {
  loading: boolean;
  storeId: string | null;
  storeNotificationEmail: {
    _id: string;
    email: string;
    isVerified: boolean;
  } | null;
  onOpenAddEmailModal: () => void;
  onVerificationSent?: () => void;
}

const SenderEmailSection: React.FC<SenderEmailSectionProps> = ({
  loading,
  storeId,
  storeNotificationEmail,
  onOpenAddEmailModal,
  onVerificationSent,
}) => {
  const { sendVerification } = useStoreNotificationEmail();
  const [sendingVerification, setSendingVerification] = useState(false);

  const relayEmail = useMemo(
    () => (storeId ? getRelayEmail(storeId) : 'store+@codiicemail.com'),
    [storeId]
  );

  const showPublicDomainNotice = Boolean(
    storeNotificationEmail?.email && isPublicEmailDomain(storeNotificationEmail.email)
  );

  const handleSendVerification = async () => {
    if (!storeNotificationEmail?._id) return;

    try {
      setSendingVerification(true);
      await sendVerification(storeNotificationEmail._id);
      toast.success('Verification email sent');
      onVerificationSent?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className={`${adminListCardClass} p-5`}>
      <h2 className="text-[13px] font-semibold text-admin-text">Sender email</h2>
      <p className="mt-1 text-[13px] text-admin-text-secondary">
        The email your store uses to send and receive emails from your customers
      </p>

      {loading ? (
        <p className="mt-4 text-[13px] text-admin-text-secondary">Loading...</p>
      ) : storeNotificationEmail ? (
        <div className="mt-4 space-y-4">
          {showPublicDomainNotice ? (
            <div className="flex gap-3 rounded-xl border border-admin-border bg-admin-secondary px-4 py-3">
              <InformationCircleIcon
                className="mt-0.5 h-5 w-5 shrink-0 text-admin-text-secondary"
                aria-hidden
              />
              <p className="text-[13px] leading-relaxed text-admin-text-secondary">
                Public domains like Gmail don&apos;t support custom sending. Customers will see your
                email as <span className="font-semibold text-admin-text">{relayEmail}</span>. For
                better brand recognition, use a custom domain or{' '}
                <Link to="/settings/domains" className={`${adminListFooterLinkClass} font-medium`}>
                  create a new one
                </Link>
                .
              </p>
            </div>
          ) : null}

          <div className="relative">
            <input
              type="email"
              value={storeNotificationEmail.email}
              readOnly
              className="w-full rounded-lg border border-admin-border bg-admin-surface py-2.5 pl-3 pr-28 text-[13px] text-admin-text"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-admin-border bg-admin-secondary px-2.5 py-1 text-[12px] font-medium text-admin-text-secondary">
              {storeNotificationEmail.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          {storeNotificationEmail.isVerified ? (
            <div className="flex items-center gap-2 text-[13px] text-admin-text">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Sender email verified</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-admin-text-secondary">
                Confirm you have access to this email.
              </p>
              <button
                type="button"
                onClick={() => void handleSendVerification()}
                disabled={sendingVerification}
                className={`${adminListSecondaryButtonClass} shrink-0`}
              >
                {sendingVerification ? 'Sending...' : 'Send verification'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-admin-text-secondary">
            Add the email address customers can reply to when they receive store notifications.
          </p>
          <button
            type="button"
            onClick={onOpenAddEmailModal}
            className={`${adminListPrimaryButtonClass} shrink-0`}
          >
            Add email
          </button>
        </div>
      )}
    </div>
  );
};

export default SenderEmailSection;
