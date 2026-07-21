import React, { useCallback } from 'react';
import HelpfulResourceItem, { HelpfulResource } from './HelpfulResourceItem';

interface HelpfulResourcesCardProps {
  resources?: HelpfulResource[];
  onResourceClick?: (resourceId: string) => void;
}

const HelpfulResourcesCard: React.FC<HelpfulResourcesCardProps> = ({
  resources = [
    {
      id: 'help-center',
      title: 'Visit our Help Center',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      id: 'academy',
      title: 'Try our Academy Page',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'forum',
      title: 'Try our Forum Area',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
  ],
  onResourceClick,
}) => {
  const handleResourceClick = useCallback(
    (resourceId: string) => {
      if (onResourceClick) {
        onResourceClick(resourceId);
      } else {
        console.log('Resource clicked:', resourceId);
      }
    },
    [onResourceClick]
  );

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm flex-1">
      {/* Header */}
      <div className="mb-4 pl-3 border-l-4 border-blue-600">
        <h3 className="text-base font-semibold text-gray-900">
          Other Helpful Resources
        </h3>
      </div>

      {/* Resources List */}
      <div className="space-y-2.5">
        {resources.map((resource) => (
          <HelpfulResourceItem
            key={resource.id}
            resource={resource}
            onClick={handleResourceClick}
          />
        ))}
      </div>
    </div>
  );
};

export default HelpfulResourcesCard;

