import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { poPrimaryButtonClass } from './purchase-order-ui.util';

const PurchaseOrdersPageHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleCreatePurchaseOrder = useCallback(() => {
    navigate('/products/purchase-orders/new');
  }, [navigate]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <DocumentTextIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Purchase orders</h1>
      </div>

      <button type="button" onClick={handleCreatePurchaseOrder} className={poPrimaryButtonClass}>
        Create purchase order
      </button>
    </div>
  );
};

export default PurchaseOrdersPageHeader;
