import {
  ArrowsUpDownIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFilterBarClass,
  adminListFilterChipClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListSearchInputClass,
} from '../components/admin-list-ui';
import StoreAccessRestrictedBanner from '../components/StoreAccessRestrictedBanner';
import {
  useContactFormSubmissions,
  type ContactFormSubmission,
  type ContactFormSubmissionStatus,
} from '../contexts/contact-form-submission.context';
import { useStore } from '../contexts/store.context';

type StatusFilter = 'all' | ContactFormSubmissionStatus;
type SortOrder = 'asc' | 'desc';

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  pending: 'Pending',
  read: 'Read',
  spam: 'Spam',
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
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: ContactFormSubmissionStatus): string {
  if (status === 'pending') return 'Pending';
  if (status === 'read') return 'Read';
  return 'Spam';
}

function statusClass(status: ContactFormSubmissionStatus): string {
  if (status === 'pending') return 'bg-[#fef3d0] text-[#6b5500]';
  if (status === 'read') return 'bg-[#cdfee1] text-[#0c5132]';
  return 'bg-admin-secondary text-admin-text-secondary';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
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
  tone: 'default' | 'pending' | 'read' | 'spam';
}) {
  const valueClass =
    tone === 'pending'
      ? 'text-[#6b5500]'
      : tone === 'read'
        ? 'text-[#0c5132]'
        : tone === 'spam'
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

export const ContactFormSubmissionsPage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { submissions, loading, fetchSubmissionsByStoreId } = useContactFormSubmissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);

  const loadSubmissions = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      await fetchSubmissionsByStoreId(activeStoreId);
    } catch {
      toast.error('Failed to load contact form submissions');
    }
  }, [activeStoreId, fetchSubmissionsByStoreId]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

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
      total: submissions.length,
      pending: submissions.filter((row) => row.status === 'pending').length,
      read: submissions.filter((row) => row.status === 'read').length,
      spam: submissions.filter((row) => row.status === 'spam').length,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = [...submissions];

    if (statusFilter !== 'all') {
      rows = rows.filter((row) => row.status === statusFilter);
    }

    if (query) {
      rows = rows.filter((row) => {
        const haystack = [row.name, row.email, row.phone ?? '', row.message]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    rows.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return rows;
  }, [submissions, searchQuery, statusFilter, sortOrder]);

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <StoreAccessRestrictedBanner />

        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon
                className="h-5 w-5 shrink-0 text-admin-text-secondary"
                aria-hidden
              />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
                Contact submissions
              </h1>
            </div>
            <p className="mt-1 max-w-2xl text-[13px] text-admin-text-secondary">
              Messages sent from your storefront contact form. Review customer inquiries, follow up
              by email, and keep track of new requests.
            </p>
          </div>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} tone="default" />
          <StatCard label="Pending" value={stats.pending} tone="pending" />
          <StatCard label="Read" value={stats.read} tone="read" />
          <StatCard label="Spam" value={stats.spam} tone="spam" />
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
                  placeholder="Search by name, email, phone, or message"
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
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-admin-border bg-admin-surface py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
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
              <p className="text-[13px] text-admin-text-secondary">Loading submissions…</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-admin-secondary">
                <InboxIcon className="h-6 w-6 text-admin-text-subdued" aria-hidden />
              </div>
              <p className="text-[14px] font-medium text-admin-text">No submissions yet</p>
              <p className="mt-1 text-[13px] text-admin-text-secondary">
                When customers submit your contact form, their messages will appear here.
              </p>
            </div>
          ) : (
            <div>
              {filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  onOpen={() => navigate(`/content/contact-submissions/${submission._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function SubmissionCard({
  submission,
  onOpen,
}: {
  submission: ContactFormSubmission;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full cursor-pointer items-start gap-4 border-b border-admin-divider bg-admin-surface px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-admin-row-hover"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-admin-secondary text-[13px] font-semibold text-admin-text-secondary">
        {initials(submission.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-admin-text">{submission.name}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(submission.status)}`}
          >
            {statusLabel(submission.status)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-admin-text-subdued">
          <span className="inline-flex items-center gap-1">
            <EnvelopeIcon className="h-3.5 w-3.5" aria-hidden />
            {submission.email}
          </span>
          {submission.phone ? (
            <span className="inline-flex items-center gap-1">
              <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
              {submission.phone}
            </span>
          ) : null}
          <span>{formatRelativeDate(submission.createdAt)}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-admin-text-secondary">
          {submission.message}
        </p>
      </div>

      <div className="shrink-0 pt-1 text-admin-text-subdued">
        <ChevronRightIcon className="h-4 w-4" aria-hidden />
      </div>
    </button>
  );
}

export default ContactFormSubmissionsPage;
