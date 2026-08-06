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
      description: 'Added Domain: fashion-0-60058040737.codiic.com',
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
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">
          Complete these few steps to launch your store
        </h2>
      </div>

      <div className="mb-4 space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-admin-border bg-admin-secondary p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[13px] font-medium text-admin-text">{step.title}</p>
              {step.description && (
                <p className="mt-0.5 truncate text-[12px] text-admin-text-secondary">{step.description}</p>
              )}
            </div>
            <button
              onClick={() => handleStepClick(step.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                step.buttonVariant === 'added'
                  ? 'border border-admin-border bg-[#cdfee1] text-[#0c5132] hover:bg-[#b7f5d1]'
                  : 'bg-admin-text text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {step.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-admin-text p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 text-[13px] font-semibold text-white">
              Try placing a test order yourself
            </h3>
            <p className="text-[12px] text-white/70">
              Experience how the process works from start to finish
            </p>
          </div>
          <button
            onClick={handleTestOrderClick}
            className="shrink-0 whitespace-nowrap rounded-lg bg-admin-surface px-3 py-1.5 text-[13px] font-semibold text-admin-text transition-colors hover:bg-admin-row-hover"
          >
            See How It Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedCard;

