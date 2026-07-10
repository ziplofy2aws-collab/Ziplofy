import React from 'react';
import toast from 'react-hot-toast';

interface SenderEmailSectionProps {
  loading: boolean;
  storeNotificationEmail: {
    email: string;
    isVerified: boolean;
  } | null;
  onOpenAddEmailModal: () => void;
}

const SenderEmailSection: React.FC<SenderEmailSectionProps> = ({
  loading,
  storeNotificationEmail,
  onOpenAddEmailModal,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
      <h2 className="text-base font-semibold mb-1 text-gray-900">Sender email</h2>
      <p className="text-sm text-gray-500 mb-4">
        The email your store uses to send emails to your customers
      </p>

      {loading ? (
        <p className="text-sm text-gray-500 py-2">Loading...</p>
      ) : storeNotificationEmail ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="email"
              value={storeNotificationEmail.email}
              disabled
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-medium h-9 flex items-center ${
                storeNotificationEmail.isVerified
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {storeNotificationEmail.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Confirm you have access to this email.{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement resend verification
                  toast.success('Verification email sent');
                }}
                className="text-gray-700 font-medium hover:underline"
              >
                Resend verification
              </button>
            </p>
          </div>
        </>
      ) : (
        <div className="flex justify-end items-center mt-2">
          <button
            type="button"
            onClick={onOpenAddEmailModal}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Add email
          </button>
        </div>
      )}
    </div>
  );
};

export default SenderEmailSection;

