import {
  ChevronDownIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import AttributionMenu from '../components/AttributionMenu';
import CampaignTrackingSection from '../components/CampaignTrackingSection';
import MarketingAppsSection from '../components/MarketingAppsSection';
import StatCard from '../components/StatCard';
import TopMarketingChannels from '../components/TopMarketingChannels';

const MarketingPage: React.FC = () => {
  const [isAttributionMenuOpen, setIsAttributionMenuOpen] = useState(false);
  const [selectedAttribution, setSelectedAttribution] = useState('Last non-direct click');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');

  const handleAttributionClick = useCallback(() => {
    setIsAttributionMenuOpen((prev) => !prev);
  }, []);

  const handleAttributionClose = useCallback(() => {
    setIsAttributionMenuOpen(false);
  }, []);

  const handleAttributionSelect = useCallback((value: string) => {
    setSelectedAttribution(value);
    setIsAttributionMenuOpen(false);
  }, []);

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
  }, []);

  const attributionOptions = [
    'Last non-direct click',
    'Last click',
    'First click',
    'Any click',
    'Linear',
  ];

  const periods = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track performance, campaigns, and marketing attribution
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/marketing/campaigns"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MegaphoneIcon className="w-4 h-4" />
                Campaigns
              </Link>
              <Link
                to="/marketing/attribution"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="w-4 h-4" />
                Attribution
              </Link>
              <Link
                to="/marketing/automations"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SparklesIcon className="w-4 h-4" />
                Automations
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={handleAttributionClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedAttribution}
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
            <AttributionMenu
              isOpen={isAttributionMenuOpen}
              options={attributionOptions}
              selectedValue={selectedAttribution}
              onSelect={handleAttributionSelect}
              onClose={handleAttributionClose}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Sessions"
              value="12,450"
              icon={<ChartBarIcon className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Sales attributed to marketing"
              value="₹45,230"
              icon={<CreditCardIcon className="w-5 h-5 text-green-600" />}
            />
            <StatCard
              title="Orders attributed to marketing"
              value="342"
              icon={<ShoppingCartIcon className="w-5 h-5 text-violet-600" />}
            />
            <StatCard
              title="Conversion rate"
              value="2.75%"
              icon={<ChartBarIcon className="w-5 h-5 text-amber-600" />}
            />
            <StatCard
              title="AOV attributed to marketing"
              value="₹132.15"
              icon={<CreditCardIcon className="w-5 h-5 text-blue-600" />}
            />
          </div>

          {/* Top marketing channels */}
          <TopMarketingChannels />

          {/* Two-column layout for sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CampaignTrackingSection />
            <MarketingAppsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
