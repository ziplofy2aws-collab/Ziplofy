import React, { useState, useRef } from 'react';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/ToggleSwitch';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const DataSharingOptOutPage: React.FC = () => {
  const navigate = useNavigate();
  const [useAutomatedSettings, setUseAutomatedSettings] = useState(false);
  const [navigationMenu, setNavigationMenu] = useState('footer');
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const moreActionsRef = useRef<HTMLButtonElement>(null);

  const handleMoreActionsClick = () => {
    setMoreActionsOpen(!moreActionsOpen);
  };

  const handleMoreActionsClose = () => {
    setMoreActionsOpen(false);
  };

  const handleBack = () => {
    navigate('/settings/customer-privacy');
  };

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Data sharing opt-out page"
          description="Data sharing opt-out allows customers in specific regions to opt out of data sharing."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to customer privacy"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="relative">
              <button
                type="button"
                ref={moreActionsRef}
                onClick={handleMoreActionsClick}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200/90 bg-white shadow-sm hover:bg-gray-50/90 transition-colors"
              >
                More actions
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {moreActionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={handleMoreActionsClose}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
                    <button
                      type="button"
                      onClick={handleMoreActionsClose}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Option 1
                    </button>
                    <button
                      type="button"
                      onClick={handleMoreActionsClose}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
                    >
                      Option 2
                    </button>
                  </div>
                </>
              )}
            </div>
          }
        />

        {/* Regions and content section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Regions and content</h2>

          {/* Use automated settings */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-0.5">Use automated settings</p>
              <p className="text-sm text-gray-500">
                Keep regions and content in sync with latest Ziplofy recommendations
              </p>
            </div>
            <ToggleSwitch
              checked={useAutomatedSettings}
              onChange={setUseAutomatedSettings}
            />
          </div>

          {/* Regions - Only visible when automated settings is OFF */}
          {!useAutomatedSettings && (
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-0.5">Regions</p>
                <p className="text-sm text-gray-500">Not active in any region</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Handle edit regions
                }}
                className="text-sm font-medium text-gray-700 hover:underline shrink-0"
              >
                Edit
              </button>
            </div>
          )}

          {/* Content - Only visible when automated settings is OFF */}
          {!useAutomatedSettings && (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-0.5">Content</p>
                <p className="text-sm text-gray-500">Customize default page content</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Handle edit content
                }}
                className="text-sm font-medium text-gray-700 hover:underline shrink-0"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Navigation section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Navigation</h2>

          <p className="text-sm text-gray-500 mb-4">
            Link to the page from your store menu, so that your visitors can easily access it.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Menu</label>
            <select
              value={navigationMenu}
              onChange={(e) => setNavigationMenu(e.target.value)}
              className="w-full max-w-xs px-3 py-2 rounded-lg text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="main">Main menu</option>
              <option value="footer">Footer menu (recommended)</option>
              <option value="customer-account">Customer account main menu</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center">
          Recommended privacy settings are for your convenience. Compliance with laws and regulations is your
          responsibility.{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Handle learn more
            }}
            className="text-gray-700 font-medium hover:underline"
          >
            Learn more
          </button>
        </p>
      </div>
    </div>
  );
};

export default DataSharingOptOutPage;

