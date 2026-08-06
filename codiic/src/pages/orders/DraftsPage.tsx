import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../../components/admin-list-ui';
import DraftsEmptyState from '../../components/orders/DraftsEmptyState';
import DraftsPageHeader from '../../components/orders/DraftsPageHeader';

const DraftsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateDraftOrder = useCallback(() => {
    navigate('/orders/drafts/new');
  }, [navigate]);

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <DraftsPageHeader />

        <div className={adminListCardClass}>
          <DraftsEmptyState onCreateDraftOrder={handleCreateDraftOrder} />
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about creating draft orders
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DraftsPage;
