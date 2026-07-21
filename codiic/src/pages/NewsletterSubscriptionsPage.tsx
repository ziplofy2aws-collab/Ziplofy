import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
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
  if (status === 'subscribed') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  return 'bg-gray-100 text-gray-600 ring-gray-200';
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  const parts = local.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function avatarColor(seed: string): string {
  const palette = [
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
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
      className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors ${
        selected ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-50'
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
  const toneClass =
    tone === 'subscribed'
      ? 'border-emerald-100 bg-emerald-50/60'
      : tone === 'unsubscribed'
        ? 'border-gray-200 bg-gray-50'
        : 'border-gray-200/80 bg-white';

  const valueClass =
    tone === 'subscribed'
      ? 'text-emerald-700'
      : tone === 'unsubscribed'
        ? 'text-gray-600'
        : 'text-gray-900';

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${toneClass}`}>
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
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
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1100px] px-3 py-4 sm:px-4">
        <StoreAccessRestrictedBanner />

        <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                <NewspaperIcon className="h-3.5 w-3.5" aria-hidden />
                Newsletter list
              </div>
              <h1 className="text-[24px] font-semibold tracking-tight text-gray-900">
                Newsletter subscriptions
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-gray-600">
                Emails collected from your storefront newsletter signup. See who is subscribed and
                who has opted out.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
              <UserGroupIcon className="h-7 w-7 text-emerald-600" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total" value={stats.total} tone="default" />
          <StatCard label="Subscribed" value={stats.subscribed} tone="subscribed" />
          <StatCard label="Unsubscribed" value={stats.unsubscribed} tone="unsubscribed" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    onClick={() => setStatusOpen((open) => !open)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors ${
                      statusFilter !== 'all'
                        ? 'border-gray-300 bg-gray-50 text-gray-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_FILTER_LABELS[statusFilter]}
                    <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  {statusOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors ${
                      sortOpen
                        ? 'border-gray-300 bg-gray-50 text-gray-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-500" />
                    {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                  </button>
                  {sortOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
            <div className="px-4 py-16 text-center text-[13px] text-gray-500">
              Loading subscriptions…
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <EnvelopeIcon className="h-6 w-6 text-gray-400" aria-hidden />
              </div>
              <p className="text-[14px] font-medium text-gray-800">No subscriptions yet</p>
              <p className="mt-1 text-[13px] text-gray-500">
                When visitors sign up for your newsletter, their emails will show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[12px] font-medium text-gray-500">
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Subscribed</th>
                    <th className="px-4 py-2.5 font-medium">Unsubscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
    <tr className="transition-colors hover:bg-gray-50/80">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${avatarColor(subscription.email)}`}
          >
            {initialsFromEmail(subscription.email)}
          </div>
          <div className="min-w-0">
            <a
              href={`mailto:${subscription.email}`}
              className="block truncate text-[13px] font-medium text-gray-900 hover:text-indigo-600"
            >
              {subscription.email}
            </a>
            <p className="text-[12px] text-gray-500">
              Added {formatRelativeDate(subscription.createdAt)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusClass(subscription.status)}`}
        >
          {statusLabel(subscription.status)}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[13px] text-gray-600">
        {formatFullDate(subscription.subscribedAt || subscription.createdAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-[13px] text-gray-600">
        {subscription.unsubscribedAt ? formatFullDate(subscription.unsubscribedAt) : '—'}
      </td>
    </tr>
  );
}

export default NewsletterSubscriptionsPage;
