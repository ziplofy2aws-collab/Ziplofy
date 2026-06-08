import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ActivityEntry } from '../../components/ActivityLogEntry';
import ActivityLogList from '../../components/ActivityLogList';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const activityEntries: ActivityEntry[] = [
  {
    id: '1',
    title: 'My Store Admin accessed shop',
    timestamp: 'November 17, 2025 at 11:17 AM GMT+5:30',
  },
  {
    id: '2',
    title: 'My Store Admin accessed shop',
    timestamp: 'November 17, 2025 at 10:32 AM GMT+5:30',
  },
  {
    id: '3',
    title: 'My Store Admin accessed shop',
    timestamp: 'November 14, 2025 at 5:28 PM GMT+5:30',
  },
  {
    id: '4',
    title: 'My Store Admin accessed shop',
    timestamp: 'November 14, 2025 at 2:46 PM GMT+5:30',
  },
  {
    id: '5',
    title: 'You included a product on Point of Sale',
    description: 't-shirt',
    timestamp: 'November 14, 2025 at 10:42 AM GMT+5:30',
    linkLabel: 't-shirt',
    linkHref: '#',
  },
  {
    id: '6',
    title: 'You included a product on Online Store',
    timestamp: 'November 14, 2025 at 10:42 AM GMT+5:30',
    linkLabel: 't-shirt',
    linkHref: '#',
  },
  {
    id: '7',
    title: 'You created a new product',
    timestamp: 'November 14, 2025 at 10:42 AM GMT+5:30',
    linkLabel: 't-shirt',
    linkHref: '#',
  },
  {
    id: '8',
    title: 'Theme was published',
    timestamp: 'November 14, 2025 at 10:40 AM GMT+5:30',
    linkLabel: 'Horizon',
    linkHref: '#',
  },
  {
    id: '9',
    title: 'My Store Admin accessed shop',
    timestamp: 'November 14, 2025 at 10:39 AM GMT+5:30',
  },
  {
    id: '10',
    title: 'Ziplofy added default retail role',
    timestamp: 'November 14, 2025 at 10:39 AM GMT+5:30',
    description: 'Associate',
  },
];

const StoreActivityLogPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/settings/general');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Store activity log"
          description="View recent activity and changes made to your store."
          leading={
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to general settings"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        <ActivityLogList entries={activityEntries} />
      </div>
    </div>
  );
};

export default StoreActivityLogPage;

