import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface FreeShippingDetailsHeaderProps {
  method: string;
  discountCode?: string;
  title?: string;
  onBack: () => void;
}

const FreeShippingDetailsHeader: React.FC<FreeShippingDetailsHeaderProps> = ({
  method,
  discountCode,
  title,
  onBack,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">
          Free Shipping Details: {method === 'discount-code' ? discountCode : title}
        </h1>
      </div>
    </div>
  );
};

export default FreeShippingDetailsHeader;

