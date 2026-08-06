import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListSearchInputClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../components/admin-list-ui';
import StoreAccessRestrictedBanner from '../components/StoreAccessRestrictedBanner';
import {
  useNewsletterSubscriptions,
  type NewsletterSubscription,
  type NewsletterSubscriptionStatus,
} from '../contexts/newsletter-subscription.context';
import { useStore } from '../contexts/store.context';

type StatusFilter = 'all' | NewsletterSubscriptionStatus;
type SortOrder = 'asc' | 'desc';

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  subscribed: 'Subscribed',
  unsubscribed: 'Unsubscribed',
};

function formatRelativeDate(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: NewsletterSubscriptionStatus): string {
  return status === 'subscribed' ? 'Subscribed' : 'Unsubscribed';
}

function statusClass(status: NewsletterSubscriptionStatus): string {
  if (status === 'subscribed') return 'bg-[#cdfee1] text-[#0c5132]';
  return 'bg-admin-secondary text-admin-text-secondary';
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const parts = local.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function FilterOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-3 py-2 text-left text-[13px] transition-colors ${
        selected
          ? 'bg-admin-row-hover font-medium text-admin-text'
          : 'text-admin-text hover:bg-admin-row-hover'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'default' | 'subscribed' | 'unsubscribed';
}) {
  const valueClass =
    tone === 'subscribed'
      ? 'text-[#0c5132]'
      : tone === 'unsubscribed'
        ? 'text-admin-text-secondary'
        : 'text-admin-text';

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-3">
      <p className="text-[12px] font-medium uppercase tracking-wide text-admin-text-subdued">
        {label}
      </p>
      <p className={`mt-1 text-[24px] font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

export const NewsletterSubscriptionsPage = () => {
  const { activeStoreId } = useStore();
  const { subscriptions, loading, fetchSubscriptionsByStoreId } = useNewsletterSubscriptions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      await fetchSubscriptionsByStoreId(activeStoreId);
    } catch {
      toast.error('Failed to load newsletter subscriptions');
    }
  }, [activeStoreId, fetchSubscriptionsByStoreId]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  useEffect(() => {
    if (!statusOpen && !sortOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (statusOpen && !statusRef.current?.contains(event.target as Node)) {
        setStatusOpen(false);
      }
      if (sortOpen && !sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusOpen, sortOpen]);

  const stats = useMemo(() => {
    return {
      total: subscriptions.length,
      subscribed: subscriptions.filter((row) => row.status === 'subscribed').length,
      unsubscribed: subscriptions.filter((row) => row.status === 'unsubscribed').length,
    };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = [...subscriptions];

    if (statusFilter !== 'all') {
      rows = rows.filter((row) => row.status === statusFilter);
    }

    if (query) {
      rows = rows.filter((row) => row.email.toLowerCase().includes(query));
    }

    rows.sort((a, b) => {
      const aTime = new Date(a.subscribedAt || a.createdAt).getTime();
      const bTime = new Date(b.subscribedAt || b.createdAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return rows;
  }, [subscriptions, searchQuery, statusFilter, sortOrder]);

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <StoreAccessRestrictedBanner />

        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <NewspaperIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
                Newsletter subscriptions
              </h1>
            </div>
            <p className="mt-1 max-w-2xl text-[13px] text-admin-text-secondary">
              Emails collected from your storefront newsletter signup. See who is subscribed and who
              has opted out.
            </p>
          </div>
        </header>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total" value={stats.total} tone="default" />
          <StatCard label="Subscribed" value={stats.subscribed} tone="subscribed" />
          <StatCard label="Unsubscribed" value={stats.unsubscribed} tone="unsubscribed" />
        </div>

        <div className={adminListCardClass}>
          <div className={adminListFilterBarClass}>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-text-subdued" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email"
                  className={adminListSearchInputClass}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    onClick={() => setStatusOpen((open) => !open)}
                    className={adminListFilterChipClass}
                  >
                    {STATUS_FILTER_LABELS[statusFilter]}
                    <ChevronDownIcon className="h-3.5 w-3.5 text-admin-text-subdued" />
                  </button>
                  {statusOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((value) => (
                        <FilterOption
                          key={value}
                          selected={statusFilter === value}
                          onClick={() => {
                            setStatusFilter(value);
                            setStatusOpen(false);
                          }}
                        >
                          {STATUS_FILTER_LABELS[value]}
                        </FilterOption>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((open) => !open)}
                    className={adminListFilterChipClass}
                  >
                    <ArrowsUpDownIcon className="h-3.5 w-3.5 text-admin-text-secondary" />
                    {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                  </button>
                  {sortOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <FilterOption
                        selected={sortOrder === 'desc'}
                        onClick={() => {
                          setSortOrder('desc');
                          setSortOpen(false);
                        }}
                      >
                        Newest first
                      </FilterOption>
                      <FilterOption
                        selected={sortOrder === 'asc'}
                        onClick={() => {
                          setSortOrder('asc');
                          setSortOpen(false);
                        }}
                      >
                        Oldest first
                      </FilterOption>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
              <p className="text-[13px] text-admin-text-secondary">Loading subscriptions…</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-admin-secondary">
                <EnvelopeIcon className="h-6 w-6 text-admin-text-subdued" aria-hidden />
              </div>
              <p className="text-[14px] font-medium text-admin-text">No subscriptions yet</p>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                When visitors sign up for your newsletter, their emails will show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className={adminListTableHeadRowClass}>
                    <th className={adminListTableHeadClass}>Email</th>
                    <th className={adminListTableHeadClass}>Status</th>
                    <th className={adminListTableHeadClass}>Subscribed</th>
                    <th className={adminListTableHeadClass}>Unsubscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((row) => (
                    <SubscriptionRow key={row._id} subscription={row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function SubscriptionRow({ subscription }: { subscription: NewsletterSubscription }) {
  return (
    <tr className="border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-secondary text-[12px] font-semibold text-admin-text-secondary">
            {initialsFromEmail(subscription.email)}
          </div>
          <div className="min-w-0">
            <a
              href={`mailto:${subscription.email}`}
              className={`block truncate text-[13px] font-medium ${adminListFooterLinkClass}`}
            >
              {subscription.email}
            </a>
            <p className="text-[12px] text-admin-text-subdued">
              Added {formatRelativeDate(subscription.createdAt)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusClass(subscription.status)}`}
        >
          {statusLabel(subscription.status)}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-admin-text-secondary">
        {formatFullDate(subscription.subscribedAt || subscription.createdAt)}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-admin-text-secondary">
        {subscription.unsubscribedAt ? formatFullDate(subscription.unsubscribedAt) : '—'}
      </td>
    </tr>
  );
}

export default NewsletterSubscriptionsPage;
