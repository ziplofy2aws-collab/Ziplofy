import React, { useCallback } from 'react';
import {
  ArrowLeftIcon,
  PlusIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const WebhooksNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const webhookSigningKey = 'bfad2685eaa342b6584e1a4b12c0735e6cc8f4343cb8b10626cef0c4dd00064d';

  const handleBackClick = useCallback(() => {
    navigate('/settings/notifications');
  }, [navigate]);

  const handleCreateWebhook = useCallback(() => {
    // TODO: Implement create webhook flow
  }, []);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Webhooks"
          description="Send XML or JSON notifications about store events to a URL."
          leading={
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to notifications"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <SettingsPanel className="p-5 sm:p-6">
          <button
            type="button"
            onClick={handleCreateWebhook}
            className="w-full flex items-center justify-start rounded-lg border border-gray-200 text-sm font-medium text-gray-700 py-2.5 px-3 mb-4 hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create webhook
          </button>

          <div className="p-3 rounded-lg bg-gray-50 flex items-center gap-2 border border-gray-200">
            <InformationCircleIcon className="w-4 h-4 text-gray-600 shrink-0" />
            <p className="text-sm text-gray-500">
              Your webhooks will be signed with{' '}
              <span className="text-gray-700 font-mono">
                {webhookSigningKey}
              </span>
            </p>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default WebhooksNotificationsPage;
