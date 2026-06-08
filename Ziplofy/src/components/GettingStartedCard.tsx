import React, { useCallback } from 'react';

export interface SetupStep {
  id: string;
  title: string;
  description?: string;
  buttonText: string;
  buttonVariant?: 'primary' | 'added';
  onClick?: () => void;
}

interface GettingStartedCardProps {
  steps?: SetupStep[];
  onStepClick?: (stepId: string) => void;
  onTestOrderClick?: () => void;
}

const GettingStartedCard: React.FC<GettingStartedCardProps> = ({
  steps = [
    {
      id: 'theme',
      title: 'Make your store stand out with the right theme',
      buttonText: 'Configure Theme',
      buttonVariant: 'primary',
    },
    {
      id: 'domain',
      title: 'Set your own domain for your store',
      description: 'Added Domain: fashion-0-60058040737.ziplofy.com',
      buttonText: 'Add Domain',
      buttonVariant: 'primary',
    },
    {
      id: 'items',
      title: "Add all the items that you'll be selling on your store",
      buttonText: 'Add Items',
      buttonVariant: 'primary',
    },
    {
      id: 'shipping',
      title: 'Set up shipping zones to deliver your items efficiently',
      buttonText: 'Setup',
      buttonVariant: 'primary',
    },
    {
      id: 'payment',
      title: 'Connect payment gateways to start accepting online payments',
      buttonText: 'Configure Online Payments',
      buttonVariant: 'primary',
    },
  ],
  onStepClick,
  onTestOrderClick,
}) => {
  const handleStepClick = useCallback(
    (stepId: string) => {
      if (onStepClick) {
        onStepClick(stepId);
      } else {
        console.log('Step clicked:', stepId);
      }
    },
    [onStepClick]
  );

  const handleTestOrderClick = useCallback(() => {
    if (onTestOrderClick) {
      onTestOrderClick();
    } else {
      console.log('Test order clicked');
    }
  }, [onTestOrderClick]);

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
      {/* Main Title */}
      <div className="mb-4 pl-3 border-l-4 border-blue-600">
        <h2 className="text-base font-semibold text-gray-900">
          Complete these few steps to launch your store
        </h2>
      </div>

      {/* Setup Steps */}
      <div className="space-y-3 mb-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between gap-4 p-4 bg-page-background-color rounded-lg border border-gray-200/80"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-0.5">{step.title}</p>
              {step.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{step.description}</p>
              )}
            </div>
            <button
              onClick={() => handleStepClick(step.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                step.buttonVariant === 'added'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
              }`}
            >
              {step.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Test Order Section */}
      <div className="bg-blue-600 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-0.5">
              Try placing a test order yourself
            </h3>
            <p className="text-xs text-blue-100">
              Experience how the process works from start to finish
            </p>
          </div>
          <button
            onClick={handleTestOrderClick}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            See How It Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedCard;

