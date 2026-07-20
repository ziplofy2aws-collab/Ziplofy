import { CubeIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreatePurchaseOrder = useCallback(() => {
    navigate('/products/purchase-orders/new');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="-m-3 min-h-full w-full p-3 text-black">
        <div className="max-w-[1000px] mx-auto">
          <div className="p-10 rounded-xl text-center bg-white border border-gray-200">
            <div className="bg-blue-50 w-[72px] h-[72px] mx-auto mb-4 border-2 border-blue-200 rounded-full flex items-center justify-center">
              <CubeIcon className="text-blue-500 w-9 h-9" />
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Manage your purchase orders</h1>
            <p className="text-base text-slate-500 mb-6">
              Track and receive inventory ordered from suppliers.
            </p>
            <button
              onClick={handleCreatePurchaseOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create purchase order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;


