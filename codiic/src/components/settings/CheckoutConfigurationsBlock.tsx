import { EllipsisHorizontalIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useState } from 'react';
import { adminListPrimaryButtonClass } from '../admin-list-ui';
import DropdownMenu from '../DropdownMenu';
import DropdownMenuItem from '../DropdownMenuItem';
import type { StoreCheckoutConfiguration } from '../../contexts/store-checkout-configurations.context';

interface CheckoutConfigurationsBlockProps {
  storeName?: string;
  configuration?: StoreCheckoutConfiguration | null;
  loading?: boolean;
  creating?: boolean;
  deleting?: boolean;
  onCreate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatLastSaved(dateString?: string | null): string {
  if (!dateString) return 'Not saved yet';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Not saved yet';

  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isSameDay) return `Today at ${time.toLowerCase()}`;
  if (isYesterday) return `Yesterday at ${time.toLowerCase()}`;

  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  return `${day} at ${time.toLowerCase()}`;
}

const CheckoutConfigurationsBlock: React.FC<CheckoutConfigurationsBlockProps> = ({
  storeName = 'My Store',
  configuration = null,
  loading = false,
  creating = false,
  deleting = false,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);

  const configurationTitle = useMemo(() => `${storeName} configuration`, [storeName]);
  const lastSavedLabel = useMemo(
    () => formatLastSaved(configuration?.updatedAt),
    [configuration?.updatedAt]
  );

  const closeMoreMenu = useCallback(() => setMoreMenuAnchor(null), []);

  const handleDelete = useCallback(() => {
    closeMoreMenu();
    onDelete?.();
  }, [closeMoreMenu, onDelete]);

  return (
    <div className="p-5 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-admin-text">Configurations</h2>
          <span className="rounded-md bg-admin-secondary px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-admin-text">
            New
          </span>
          <button
            type="button"
            className="text-admin-text-subdued transition-colors hover:text-admin-text-secondary"
            aria-label="About configurations"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-admin-text-secondary">Customize checkout and customer accounts</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-admin-border bg-admin-surface p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-48 rounded bg-admin-fill" />
            <div className="h-3 w-36 rounded bg-admin-secondary" />
          </div>
        </div>
      ) : configuration ? (
        <div className="flex flex-col gap-4 rounded-xl border border-admin-border bg-admin-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-admin-text">{configurationTitle}</p>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-admin-text-subdued">Last saved: {lastSavedLabel}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={(e) => setMoreMenuAnchor(moreMenuOpen ? null : e.currentTarget)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-text-secondary transition-colors hover:bg-admin-row-hover"
              aria-label="More configuration actions"
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
            <DropdownMenu anchorEl={moreMenuAnchor} open={moreMenuOpen} onClose={closeMoreMenu}>
              <DropdownMenuItem onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete configuration'}
              </DropdownMenuItem>
            </DropdownMenu>
            <button type="button" onClick={onEdit} className={adminListPrimaryButtonClass}>
              Edit
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-admin-border bg-admin-fill/50 p-5 sm:p-6">
          <p className="text-sm font-medium text-admin-text">No checkout configuration yet</p>
          <p className="mt-1 max-w-xl text-sm text-admin-text-secondary">
            Create a configuration to customize your checkout, thank you page, and customer account
            screens.
          </p>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className={`mt-4 ${adminListPrimaryButtonClass}`}
          >
            {creating ? 'Creating…' : 'Create configuration'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutConfigurationsBlock;
