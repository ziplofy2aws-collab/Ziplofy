import React from "react";

interface FreeShippingGeneralInfoCardProps {
  method: string;
  discountCode?: string;
  title?: string;
  eligibility?: string;
  applyOnPOSPro?: boolean;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const FreeShippingGeneralInfoCard: React.FC<FreeShippingGeneralInfoCardProps> = ({
  method,
  discountCode,
  title,
  eligibility,
  applyOnPOSPro,
  status,
  createdAt,
  updatedAt,
}) => {
  const renderBoolean = (v?: boolean) => (v ? 'Yes' : 'No');

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Method</p>
          <p className="text-[13px] text-gray-900">{method}</p>
        </div>
        {method === 'discount-code' && (
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Code</p>
            <p className="text-[13px] text-gray-900">{discountCode}</p>
          </div>
        )}
        {method === 'automatic' && (
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Title</p>
            <p className="text-[13px] text-gray-900">{title}</p>
          </div>
        )}
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Eligibility</p>
          <p className="text-[13px] text-gray-900">{eligibility}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Apply on POS Pro</p>
          <p className="text-[13px] text-gray-900">{renderBoolean(applyOnPOSPro)}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Status</p>
          <p className="text-[13px] text-gray-900">{status}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Created At</p>
          <p className="text-[13px] text-gray-900">{createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-500 mb-1">Last Updated</p>
          <p className="text-[13px] text-gray-900">{updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}</p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FreeShippingGeneralInfoCard;

