import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React from 'react';

const DraftsPageHeader: React.FC = () => {
  return (
    <div className="mb-4 flex min-w-0 items-center gap-2">
      <DocumentTextIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
      <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Drafts</h1>
    </div>
  );
};

export default DraftsPageHeader;
