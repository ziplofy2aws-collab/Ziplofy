import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface AbandonedCartDetailsHeaderProps {
  customerFirstName: string;
  customerLastName: string;
  onBack: () => void;
  onSendEmail: () => void;
}

const AbandonedCartDetailsHeader: React.FC<AbandonedCartDetailsHeaderProps> = ({
  customerFirstName,
  customerLastName,
  onBack,
  onSendEmail,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-medium text-gray-900">{customerFirstName} {customerLastName}</h1>
        </div>
      </div>
      <button
        onClick={onSendEmail}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
      >
        <PaperAirplaneIcon className="w-4 h-4" />
        Send Email
      </button>
    </div>
  );
};

export default AbandonedCartDetailsHeader;

