import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transferPrimaryButtonClass } from './transfer-ui.util';

const TransfersPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTransfer = useCallback(() => {
    navigate('/products/transfers/new');
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <ArrowPathIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Transfers</h1>
      </div>

      <button type="button" onClick={handleCreateTransfer} className={transferPrimaryButtonClass}>
        Create transfer
      </button>
    </div>
  );
};

export default TransfersPageHeader;
