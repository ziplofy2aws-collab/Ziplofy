import { ChevronDownIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../admin-list-ui';
import DropdownMenu from '../DropdownMenu';
import DropdownMenuItem from '../DropdownMenuItem';

type OrdersPageHeaderProps = {
  onExport?: () => void;
  showAnalyticsBar: boolean;
  onToggleAnalyticsBar: () => void;
};

const OrdersPageHeader: React.FC<OrdersPageHeaderProps> = ({
  onExport,
  showAnalyticsBar,
  onToggleAnalyticsBar,
}) => {
  const navigate = useNavigate();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);

  const handleCreateOrder = useCallback(() => {
    navigate('/orders/drafts/new');
  }, [navigate]);

  const closeMoreMenu = useCallback(() => setMoreMenuAnchor(null), []);

  const handleToggleAnalyticsBar = useCallback(() => {
    onToggleAnalyticsBar();
    closeMoreMenu();
  }, [onToggleAnalyticsBar, closeMoreMenu]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <ShoppingBagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Orders</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onExport} className={adminListSecondaryButtonClass}>
          Export
        </button>
        <button
          type="button"
          onClick={(e) => setMoreMenuAnchor(moreMenuOpen ? null : e.currentTarget)}
          aria-expanded={moreMenuOpen}
          aria-haspopup="menu"
          className={`${adminListSecondaryButtonClass} gap-1`}
        >
          More actions
          <ChevronDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" aria-hidden />
        </button>
        <DropdownMenu anchorEl={moreMenuAnchor} open={moreMenuOpen} onClose={closeMoreMenu}>
          <DropdownMenuItem onClick={handleToggleAnalyticsBar}>
            {showAnalyticsBar ? 'Hide analytics bar' : 'Show analytics bar'}
          </DropdownMenuItem>
        </DropdownMenu>
        <button type="button" onClick={handleCreateOrder} className={adminListPrimaryButtonClass}>
          Create order
        </button>
      </div>
    </div>
  );
};

export default OrdersPageHeader;
