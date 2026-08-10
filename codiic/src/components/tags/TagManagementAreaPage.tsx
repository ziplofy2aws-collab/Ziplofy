import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../admin-list-ui';
import { SettingsHero } from '../settings/SettingsPageScaffold';
import { tagBackButtonClass } from './tag-management-ui';

type TagManagementAreaPageProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const TagManagementAreaPage: React.FC<TagManagementAreaPageProps> = ({
  title,
  description,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/tag-management');
  }, [navigate]);

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} flex flex-col gap-6`}>
        <SettingsHero
          title={title}
          description={description}
          leading={
            <button
              type="button"
              onClick={handleBack}
              className={tagBackButtonClass}
              aria-label="Back to tag management"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />
        {children}
      </div>
    </div>
  );
};

export default TagManagementAreaPage;
