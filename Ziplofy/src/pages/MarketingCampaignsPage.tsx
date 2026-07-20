import React, { useCallback } from "react";
import CampaignTrackingCard from "../components/CampaignTrackingCard";
import MarketingAppsCard from "../components/MarketingAppsCard";

const MarketingCampaignsPage: React.FC = () => {
  
  const handleCreateCampaign = useCallback(() => {
    // Handle create campaign action
  }, []);

  const handleLearnMore = useCallback(() => {
    // Handle learn more action
  }, []);

  const handleBrowseApps = useCallback(() => {
    // Handle browse apps action
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage your marketing campaigns</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
            {/* Card 1 */}
            <CampaignTrackingCard
              onCreateCampaign={handleCreateCampaign}
              onLearnMore={handleLearnMore}
            />

          {/* Card 2 */}
          <MarketingAppsCard onBrowseApps={handleBrowseApps} />
        </div>
      </div>
    </div>
  );
};

export default MarketingCampaignsPage;
