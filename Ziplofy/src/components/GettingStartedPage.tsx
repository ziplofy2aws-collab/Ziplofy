import React from 'react';
import GettingStartedCard from './GettingStartedCard';
import HelpfulResourcesCard from './HelpfulResourcesCard';
import ImproveYourStoreCard from './ImproveYourStoreCard';
import OverviewVideoCard from './OverviewVideoCard';

interface GettingStartedPageProps {
  onStepClick?: (stepId: string) => void;
  onTestOrderClick?: () => void;
  onImprovementClick?: (itemId: string) => void;
  onResourceClick?: (resourceId: string) => void;
}

const GettingStartedPage: React.FC<GettingStartedPageProps> = ({
  onStepClick,
  onTestOrderClick,
  onImprovementClick,
  onResourceClick,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome to <span className="text-blue-600">Ziplofy</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Let's set up your e-commerce store and manage your business effectively
        </p>
      </div>

      {/* Getting Started Card */}
      <GettingStartedCard onStepClick={onStepClick} onTestOrderClick={onTestOrderClick} />

      {/* Improve Your Store Card */}
      <ImproveYourStoreCard onItemClick={onImprovementClick} />

      {/* Video and Resources Section */}
      <div className="flex gap-4">
        <OverviewVideoCard />
        <HelpfulResourcesCard onResourceClick={onResourceClick} />
      </div>
    </div>
  );
};

export default GettingStartedPage;

