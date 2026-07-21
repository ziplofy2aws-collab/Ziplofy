import React from "react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const DiscountNotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/discounts');
  }, [navigate]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Discount not found</h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to discounts
        </button>
      </div>
    </div>
  );
};

export default DiscountNotFound;

