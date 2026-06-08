import { InformationCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';
import type { DataSaleOption } from '../contexts/pixel.context';
import AddPixelModalActions from './AddPixelModalActions';
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
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Did you check available apps first? Apps are the most secure option, with automatic
          updates, for integrating with third-party services.{' '}
          <a href="#" className="text-blue-600 hover:underline">Explore pixels apps</a>
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Pixel name</label>
        <input
          type="text"
          value={pixelName}
          onChange={(e) => onPixelNameChange(e.target.value.slice(0, maxName))}
          maxLength={maxName}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 text-right mt-1">{pixelName.length}/{maxName}</p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data sale
        </label>
        <div className="border border-gray-200 rounded-lg p-4">
          <fieldset className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="dataSale"
                value="qualifies_as_data_sale"
                checked={dataSale === 'qualifies_as_data_sale'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className="mt-1 w-4 h-4 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-900">Data collected qualifies as data sale</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="dataSale"
                value="qualifies_as_data_sale_limited_use"
                checked={dataSale === 'qualifies_as_data_sale_limited_use'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className="mt-1 w-4 h-4 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-900">Data collected qualifies as data sale and supports limited data use</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="dataSale"
                value="does_not_qualify_as_data_sale"
                checked={dataSale === 'does_not_qualify_as_data_sale'}
                onChange={(e) => onDataSaleChange(e.target.value as DataSaleOption)}
                className="mt-1 w-4 h-4 text-gray-900 focus:ring-gray-900"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-900 block">Data collected does not qualify as data sale</span>
                <span className="text-xs text-gray-600 block mt-1">
                  The pixel will collect data when the customers opts out of their data being sold.
                </span>
              </div>
            </label>
          </fieldset>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-6" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Code
          </label>
          <span className="text-xs text-gray-500">i</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y"
        />
      </div>

      <p className="text-sm text-gray-600 mt-4">
        This is an advanced feature that requires JavaScript knowledge. Ziplofy is not responsible
        for your use of pixels. Compliance with applicable laws, consents, code security, troubleshooting,
        and updates are your responsibility. Pixels are subject to the Terms of Service.
      </p>
    </Modal>
  );
};

export default AddPixelModal;

