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
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
          Welcome to <span className="text-admin-text">codiic</span>
        </h1>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Let&apos;s set up your e-commerce store and manage your business effectively
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

