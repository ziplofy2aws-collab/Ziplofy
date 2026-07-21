import { ChevronDownIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <ShoppingBagIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
        >
          Export
        </button>
        <button
          type="button"
          onClick={(e) => setMoreMenuAnchor(moreMenuOpen ? null : e.currentTarget)}
          aria-expanded={moreMenuOpen}
          aria-haspopup="menu"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
        >
          More actions
          <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        </button>
        <DropdownMenu anchorEl={moreMenuAnchor} open={moreMenuOpen} onClose={closeMoreMenu}>
          <DropdownMenuItem onClick={handleToggleAnalyticsBar}>
            {showAnalyticsBar ? 'Hide analytics bar' : 'Show analytics bar'}
          </DropdownMenuItem>
        </DropdownMenu>
        <button
          type="button"
          onClick={handleCreateOrder}
          className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
        >
          Create order
        </button>
      </div>
    </div>
  );
};

export default OrdersPageHeader;
