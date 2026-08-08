import { InformationCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import type { DataSaleOption } from '../contexts/pixel.context';
import AddPixelModalActions from './AddPixelModalActions';
import { adminListFooterLinkClass } from './admin-list-ui';
import Modal from './Modal';

interface AddPixelModalProps {
  open: boolean;
  onClose: () => void;
  pixelName: string;
  onPixelNameChange: (value: string) => void;
  dataSale: DataSaleOption;
  onDataSaleChange: (value: DataSaleOption) => void;
  code: string;
  onCodeChange: (value: string) => void;
  isValid: boolean;
  loading: boolean;
  onCreate: () => void;
  maxName: number;
}

const fieldClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-[13px] text-admin-text outline-none transition-colors focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]/30';

const radioClass =
  'mt-1 h-4 w-4 border-admin-border text-admin-text focus:ring-2 focus:ring-[#005bd3]/30 focus:ring-offset-0';

const AddPixelModal: React.FC<AddPixelModalProps> = ({
  open,
  onClose,
  pixelName,
  onPixelNameChange,
  dataSale,
  onDataSaleChange,
  code,
  onCodeChange,
  isValid,
  loading,
  onCreate,
  maxName,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add custom pixel"
      maxWidth="sm"
      actions={
        <AddPixelModalActions
          onClose={onClose}
          onCreate={onCreate}
          isValid={isValid}
          loading={loading}
        />
      }
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-admin-border bg-admin-secondary p-3">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-admin-text-secondary" />
        <p className="text-[13px] text-admin-text-secondary">
          Did you check available apps first? Apps are the most secure option, with automatic
          updates, for integrating with third-party services.{' '}
          <a href="#" className={adminListFooterLinkClass}>
            Explore pixels apps
          </a>
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-[13px] font-semibold text-admin-text">Pixel name</label>
        <input
          type="text"
          value={pixelName}
          onChange={(e) => onPixelNameChange(e.target.value.slice(0, maxName))}
          maxLength={maxName}
          className={fieldClass}
        />
        <p className="mt-1 text-right text-[12px] text-admin-text-subdued">
          {pixelName.length}/{maxName}
        </p>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-[13px] font-semibold text-admin-text">Data sale</label>
        <div className="rounded-lg border border-admin-border p-4">
          <fieldset className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="dataSale"
                value="qualifies_as_data_sale"
                checked={dataSale === 'qualifies_as_data_sale'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className={radioClass}
              />
              <span className="text-[13px] text-admin-text">
                Data collected qualifies as data sale
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="dataSale"
                value="qualifies_as_data_sale_limited_use"
                checked={dataSale === 'qualifies_as_data_sale_limited_use'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className={radioClass}
              />
              <span className="text-[13px] text-admin-text">
                Data collected qualifies as data sale and supports limited data use
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="dataSale"
                value="does_not_qualify_as_data_sale"
                checked={dataSale === 'does_not_qualify_as_data_sale'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className={radioClass}
              />
              <div className="flex-1">
                <span className="block text-[13px] text-admin-text">
                  Data collected does not qualify as data sale
                </span>
                <span className="mt-1 block text-[12px] text-admin-text-secondary">
                  The pixel will collect data when the customers opts out of their data being sold.
                </span>
              </div>
            </label>
          </fieldset>
        </div>
      </div>

      <div className="my-6 h-px bg-admin-divider" />

      <div>
        <div className="mb-2 flex items-center gap-2">
          <label className="block text-[13px] font-semibold text-admin-text">Code</label>
          <span className="text-[12px] text-admin-text-subdued">i</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          rows={6}
          className={`${fieldClass} resize-y font-mono`}
        />
      </div>

      <p className="mt-4 text-[13px] text-admin-text-secondary">
        This is an advanced feature that requires JavaScript knowledge. codiic is not responsible
        for your use of pixels. Compliance with applicable laws, consents, code security,
        troubleshooting, and updates are your responsibility. Pixels are subject to the Terms of
        Service.
      </p>
    </Modal>
  );
};

export default AddPixelModal;
