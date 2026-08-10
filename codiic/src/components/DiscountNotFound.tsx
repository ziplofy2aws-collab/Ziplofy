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
      <div className="bg-admin-surface rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Discount not found</h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 text-admin-text border border-admin-border rounded-md hover:bg-admin-row-hover transition-colors"
        >
          Back to discounts
        </button>
      </div>
    </div>
  );
};

export default DiscountNotFound;

