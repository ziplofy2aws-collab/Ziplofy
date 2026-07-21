import React from 'react';

interface PlanDetailsSectionProps {
  onCancelTrial: () => void;
  onChoosePlan: () => void;
}

const PlanDetailsSection: React.FC<PlanDetailsSectionProps> = ({
  onCancelTrial,
  onChoosePlan,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Plan details</h2>
        <p className="mt-1 text-sm text-gray-500">Review your current plan and manage trial actions.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-gray-900">Trial</p>
          <p className="mt-1 text-sm text-gray-500">Choose a plan anytime. You can cancel your trial if needed.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onCancelTrial}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel trial
          </button>
          <button
            onClick={onChoosePlan}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Choose plan
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        View the{' '}
        <a href="#" className="text-gray-700 hover:underline">
          terms of service
        </a>{' '}
        and{' '}
        <a href="#" className="text-gray-700 hover:underline">
          privacy policy
        </a>
      </p>
    </div>
  );
};

export default PlanDetailsSection;

