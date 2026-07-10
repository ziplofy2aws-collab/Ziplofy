import React, { useCallback } from 'react';
import Modal from '../Modal';
import ProductDescriptionInput from '../products/ProductDescriptionInput';
import { RECOVERY_EMAIL_TEMPLATE_OPTIONS } from '../../utils/recovery-email-templates';

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
}

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

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        <div>
          <h2 className="text-base font-medium text-gray-900">Send Recovery Email</h2>
          {customer && (
            <p className="text-xs text-gray-500 mt-1">
              To: {customer.firstName} {customer.lastName} ({customer.email})
            </p>
          )}
        </div>
      }
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
            onClick={onSubmit}
            disabled={!emailSubject.trim() || !emailBody.trim()}
            className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
          >
            Send Email
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Template Selection */}
        <div>
          <label htmlFor="email-template" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Template
          </label>
          <select
            id="email-template"
            value={emailTemplate}
            onChange={handleTemplateChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
          >
            {RECOVERY_EMAIL_TEMPLATE_OPTIONS.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Subject
          </label>
          <input
            id="email-subject"
            type="text"
            value={emailSubject}
            onChange={handleSubjectChange}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            required
          />
        </div>

        {/* Body Field */}
        <div>
          <ProductDescriptionInput
            value={emailBody}
            onChange={onBodyChange}
            placeholder="Write your recovery message..."
            enableImages={false}
            enableTemplates={false}
          />
        </div>

        {/* Preview Section */}
        <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Preview:</h4>
          <p className="text-xs font-medium text-gray-900 mb-1.5">Subject: {emailSubject}</p>
          <div
            className="text-[13px] text-gray-700
              [&_h1]:my-2 [&_h1]:text-2xl [&_h1]:font-semibold
              [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold
              [&_h3]:my-1.5 [&_h3]:text-lg [&_h3]:font-semibold
              [&_p]:my-1.5 [&_p]:leading-relaxed
              [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
              [&_strong]:font-semibold
              [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: emailBody || '<p></p>' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendRecoveryEmailModal;

