import React, { useCallback, useState } from "react";
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

const MarketingAttributionPage: React.FC = () => {
  const [isChannelsMenuOpen, setIsChannelsMenuOpen] = useState(false);
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);
  const [isAttributionMenuOpen, setIsAttributionMenuOpen] = useState(false);
  const [isMetricsMenuOpen, setIsMetricsMenuOpen] = useState(false);

  const [selectedChannels, setSelectedChannels] = useState<string>('Channels');
  const [selectedGranularity, setSelectedGranularity] = useState<string>('Daily');
  const [selectedAttribution, setSelectedAttribution] = useState<string>('Last non-direct click');
  const [selectedMetric, setSelectedMetric] = useState<string>('Sessions by top 5 channels over time');

  const handleChannelsClick = useCallback(() => {
    setIsChannelsMenuOpen((prev) => !prev);
  }, []);

  const handleChannelsClose = useCallback(() => {
    setIsChannelsMenuOpen(false);
  }, []);

  const handleGranularityClick = useCallback(() => {
    setIsGranularityMenuOpen((prev) => !prev);
  }, []);

  const handleGranularityClose = useCallback(() => {
    setIsGranularityMenuOpen(false);
  }, []);

  const handleAttributionClick = useCallback(() => {
    setIsAttributionMenuOpen((prev) => !prev);
  }, []);

  const handleAttributionClose = useCallback(() => {
    setIsAttributionMenuOpen(false);
  }, []);

  const handleMetricsClick = useCallback(() => {
    setIsMetricsMenuOpen((prev) => !prev);
  }, []);

  const handleMetricsClose = useCallback(() => {
    setIsMetricsMenuOpen(false);
  }, []);

  const handleChannelsSelect = useCallback((value: string) => {
    setSelectedChannels(value);
    setIsChannelsMenuOpen(false);
  }, []);

  const handleGranularitySelect = useCallback((value: string) => {
    setSelectedGranularity(value);
    setIsGranularityMenuOpen(false);
  }, []);

  const handleAttributionSelect = useCallback((value: string) => {
    setSelectedAttribution(value);
    setIsAttributionMenuOpen(false);
  }, []);

  const handleMetricSelect = useCallback((value: string) => {
    setSelectedMetric(value);
    setIsMetricsMenuOpen(false);
  }, []);

  const channelsOptions = ['Channels', 'Campaign activities'];
  const granularityOptions = ['Daily', 'Hourly', 'Weekly'];
  const attributionOptions = ['Last non-direct click', 'Last click', 'First click', 'Any click', 'Linear'];
  const metricOptions = [
    'Sessions by top 5 channels over time',
    'Sales by top 5 channels over time',
    'Orders by top 5 channels over time',
    'AOV by top 5 channels over time',
    'Orders from new customers by top 5 channels over time',
    'Orders from returning customers by top 5 channels over time'
  ];

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Attribution</h1>
          <p className="text-sm text-gray-600 mt-1">Analyze marketing performance and attribution models</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm mb-6">
          <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={handleChannelsClick}
                >
                  {selectedChannels}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Channels menu */}
                {isChannelsMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={handleChannelsClose}
                    />
                    <div className="absolute top-full left-0 mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Channels</p>
                      </div>
                      {channelsOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleChannelsSelect(opt)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                            selectedChannels === opt
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Last 30 days
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={handleGranularityClick}
                >
                  {selectedGranularity}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Granularity menu */}
                {isGranularityMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={handleGranularityClose}
                    />
                    <div className="absolute top-full left-0 mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      {granularityOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleGranularitySelect(opt)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                            selectedGranularity === opt
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Print
              </button>
              <button className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Export
              </button>

              <div className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={handleAttributionClick}
                >
                  {selectedAttribution}
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Attribution model menu */}
                {isAttributionMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={handleAttributionClose}
                    />
                    <div className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Attribution model</p>
                      </div>
                      {attributionOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAttributionSelect(opt)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                            selectedAttribution === opt
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                      <div className="px-3 py-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          A 30-day attribution window applies.{' '}
                          <button className="text-gray-700 hover:text-gray-900 underline">
                            Learn more
                          </button>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Metrics segment */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <div className="relative">
                    <button
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={handleMetricsClick}
                    >
                      {selectedMetric}
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>

                    {/* Metrics menu */}
                    {isMetricsMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={handleMetricsClose}
                        />
                        <div className="absolute top-full left-0 mt-1 w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          {metricOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleMetricSelect(opt)}
                              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                                selectedMetric === opt
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  No data found for the date range selected. Please select a different period.
                </p>
              </div>
            </div>

          {/* Additional empty cards to mirror UI structure */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FunnelIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-8">
              <p className="text-center mb-1.5 text-sm font-medium text-gray-900">
                No data found for the date range selected
              </p>
              <p className="text-center text-sm text-gray-600">
                Please select a different period
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FunnelIcon className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-8">
              <p className="text-center mb-1.5 text-sm font-medium text-gray-900">
                No data found for the date range selected
              </p>
              <p className="text-center text-sm text-gray-600">
                Please select a different period
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingAttributionPage;
