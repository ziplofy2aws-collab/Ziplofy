import React, { useCallback } from 'react';
import Modal from '../Modal';
import ProductDescriptionInput from '../products/ProductDescriptionInput';
import {
  RECOVERY_EMAIL_TEMPLATE_OPTIONS,
  RECOVERY_EMAIL_TEST_RECIPIENT,
} from '../../utils/recovery-email-templates';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
}

interface SendRecoveryEmailModalProps {
  isOpen: boolean;
  customer: Customer | null;
  emailSubject: string;
  emailBody: string;
  emailTemplate: string;
  onClose: () => void;
  onTemplateChange: (template: string) => void;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
  onSubmit: () => void;
  sending?: boolean;
}

const fieldClassName =
  'w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

const SendRecoveryEmailModal: React.FC<SendRecoveryEmailModalProps> = ({
  isOpen,
  customer,
  emailSubject,
  emailBody,
  emailTemplate,
  onClose,
  onTemplateChange,
  onSubjectChange,
  onBodyChange,
  onSubmit,
  sending = false,
}) => {
  const handleTemplateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onTemplateChange(e.target.value);
    },
    [onTemplateChange]
  );

  const handleSubjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSubjectChange(e.target.value);
    },
    [onSubjectChange]
  );

  const canSend = emailSubject.trim().length > 0 && emailBody.trim().length > 0;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Send recovery email"
      maxWidth="lg"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend || sending}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send email'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {customer ? (
          <div className="space-y-1">
            <p className="text-[13px] text-gray-500">
              Cart for{' '}
              <span className="text-gray-800">
                {customer.firstName} {customer.lastName}
              </span>
            </p>
            <p className="text-[12px] text-gray-500">
              Email will be sent to{' '}
              <span className="font-medium text-gray-700">{RECOVERY_EMAIL_TEST_RECIPIENT}</span>{' '}
              (test mode)
            </p>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold text-gray-900">Template</span>
          <select
            id="email-template"
            value={emailTemplate}
            onChange={handleTemplateChange}
            className={fieldClassName}
          >
            {RECOVERY_EMAIL_TEMPLATE_OPTIONS.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold text-gray-900">Subject</span>
          <input
            id="email-subject"
            type="text"
            value={emailSubject}
            onChange={handleSubjectChange}
            className={fieldClassName}
            required
          />
        </label>

        <div>
          <span className="mb-1 block text-[13px] font-semibold text-gray-900">Message</span>
          <ProductDescriptionInput
            value={emailBody}
            onChange={onBodyChange}
            placeholder="Write your recovery message…"
            hideLabel
            enableImages={false}
            enableTemplates={false}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendRecoveryEmailModal;
