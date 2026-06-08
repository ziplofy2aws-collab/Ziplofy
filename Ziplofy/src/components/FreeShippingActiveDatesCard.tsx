import React from "react";

interface FreeShippingActiveDatesCardProps {
  startDate?: string;
  startTime?: string;
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;
}

const FreeShippingActiveDatesCard: React.FC<FreeShippingActiveDatesCardProps> = ({
  startDate,
  startTime,
  setEndDate,
  endDate,
  endTime,
}) => {
  const renderBoolean = (v?: boolean) => (v ? 'Yes' : 'No');

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Active dates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Start date</p>
            <p className="text-sm text-gray-900">{startDate || '-'} {startTime ? `at ${startTime}` : ''}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Set end date</p>
            <p className="text-sm text-gray-900">{renderBoolean(setEndDate)}</p>
          </div>
          {setEndDate && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">End date</p>
              <p className="text-sm text-gray-900">{endDate || '-'} {endTime ? `at ${endTime}` : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeShippingActiveDatesCard;

