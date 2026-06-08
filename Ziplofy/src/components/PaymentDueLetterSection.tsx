import React, { useCallback, useState } from 'react';

interface PaymentDueLetterSectionProps {
  paymentTerms?: string;
  onPaymentTermsChange?: (terms: string) => void;
  onCancel?: () => void;
  onCreateOrder?: () => void;
  onSetupReminders?: () => void;
}

const PaymentDueLetterSection: React.FC<PaymentDueLetterSectionProps> = ({
  paymentTerms = 'Due on receipt',
  onPaymentTermsChange,
  onCancel,
  onCreateOrder,
  onSetupReminders,
}) => {
  const [selectedTerms, setSelectedTerms] = useState(paymentTerms);

  const paymentTermsOptions = [
    'Due on receipt',
    'Net 15',
    'Net 30',
    'Net 60',
    'Due on delivery',
  ];

  const handleTermsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTerms = e.target.value;
      setSelectedTerms(newTerms);
      if (onPaymentTermsChange) {
        onPaymentTermsChange(newTerms);
      }
    },
    [onPaymentTermsChange]
  );

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      console.log('Cancel clicked');
    }
  }, [onCancel]);

  const handleCreateOrder = useCallback(() => {
    if (onCreateOrder) {
      onCreateOrder();
    } else {
      console.log('Create order clicked');
    }
  }, [onCreateOrder]);

  const handleSetupReminders = useCallback(() => {
    if (onSetupReminders) {
      onSetupReminders();
    } else {
      console.log('Setup automatic payment reminders clicked');
    }
  }, [onSetupReminders]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200/80">
        <div className="pl-3 border-l-4 border-blue-600">
          <h3 className="text-base font-semibold text-gray-900">Payment due letter</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your Ziplofy Payment is Due - Ensure Uninterrupted Service Today!
          </p>
        </div>
      </div>

      {/* Payment Terms Section */}
      <div className="px-5 py-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Payment terms</label>
          <select
            value={selectedTerms}
            onChange={handleTermsChange}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            {paymentTermsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-4" />

        {/* Informational Text */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Payment due when invoice is sent. You'll be able to collect payment from the order page.
          </p>
          <p className="text-sm text-gray-600">
            you can also{' '}
            <button
              onClick={handleSetupReminders}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              set up automatic payment reminders
            </button>{' '}
            for customers.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-page-background-color border-t border-gray-200/80">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Review your order at a glance on the Order Summary page.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDueLetterSection;

