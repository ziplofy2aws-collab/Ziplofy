import {
  ArrowsUpDownIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
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

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'long',
      month: 'long',
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
  if (status === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-100';
  if (status === 'read') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  return 'bg-rose-50 text-rose-700 ring-rose-100';
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    'bg-indigo-100 text-indigo-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
  tone: 'default' | 'pending' | 'read' | 'spam';
}) {
  const toneClass =
    tone === 'pending'
      ? 'border-amber-100 bg-amber-50/60'
      : tone === 'read'
        ? 'border-emerald-100 bg-emerald-50/60'
        : tone === 'spam'
          ? 'border-rose-100 bg-rose-50/60'
          : 'border-gray-200/80 bg-white';

  const valueClass =
    tone === 'pending'
      ? 'text-amber-700'
      : tone === 'read'
        ? 'text-emerald-700'
        : tone === 'spam'
          ? 'text-rose-700'
          : 'text-gray-900';

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${toneClass}`}>
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-[24px] font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

export const ContactFormSubmissionsPage = () => {
  const { activeStoreId } = useStore();
  const { submissions, loading, fetchSubmissionsByStoreId } = useContactFormSubmissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const expandedSubmission = useMemo(
    () => filteredSubmissions.find((row) => row._id === expandedId) ?? null,
    [expandedId, filteredSubmissions]
  );

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1100px] px-3 py-4 sm:px-4">
        <StoreAccessRestrictedBanner />

        <div className="mb-5 overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/50 shadow-sm">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[12px] font-medium text-indigo-700 ring-1 ring-indigo-100">
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" aria-hidden />
                Contact form inbox
              </div>
              <h1 className="text-[24px] font-semibold tracking-tight text-gray-900">
                Contact submissions
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-gray-600">
                Messages sent from your storefront contact form. Review customer inquiries, follow up
                by email, and keep track of new requests.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-indigo-100">
              <InboxIcon className="h-7 w-7 text-indigo-600" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} tone="default" />
          <StatCard label="Pending" value={stats.pending} tone="pending" />
          <StatCard label="Read" value={stats.read} tone="read" />
          <StatCard label="Spam" value={stats.spam} tone="spam" />
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
                  placeholder="Search by name, email, phone, or message"
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
                    <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
              Loading submissions…
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <InboxIcon className="h-6 w-6 text-gray-400" aria-hidden />
              </div>
              <p className="text-[14px] font-medium text-gray-800">No submissions yet</p>
              <p className="mt-1 text-[13px] text-gray-500">
                When customers submit your contact form, their messages will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSubmissions.map((submission) => {
                const expanded = expandedId === submission._id;
                return (
                  <SubmissionCard
                    key={submission._id}
                    submission={submission}
                    expanded={expanded}
                    onToggle={() => toggleExpanded(submission._id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {expandedSubmission ? (
          <SubmissionDetailPanel
            submission={expandedSubmission}
            onClose={() => setExpandedId(null)}
          />
        ) : null}
      </div>
    </div>
  );
};

function SubmissionCard({
  submission,
  expanded,
  onToggle,
}: {
  submission: ContactFormSubmission;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-50/80 ${
        expanded ? 'bg-indigo-50/40' : ''
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${avatarColor(submission.name)}`}
      >
        {initials(submission.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-gray-900">{submission.name}</p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${statusClass(submission.status)}`}
          >
            {statusLabel(submission.status)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500">
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

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-gray-700">
          {submission.message}
        </p>
      </div>

      <div className="shrink-0 pt-1 text-gray-400">
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronDownIcon className="h-4 w-4" aria-hidden />
        )}
      </div>
    </button>
  );
}

function SubmissionDetailPanel({
  submission,
  onClose,
}: {
  submission: ContactFormSubmission;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
      <button
        type="button"
        aria-label="Close submission details"
        className="absolute inset-0"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
              Submission details
            </p>
            <h2 className="mt-1 truncate text-[18px] font-semibold text-gray-900">
              {submission.name}
            </h2>
            <p className="mt-1 text-[12px] text-gray-500">{formatFullDate(submission.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-semibold ${avatarColor(submission.name)}`}
            >
              {initials(submission.name)}
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset ${statusClass(submission.status)}`}
              >
                {statusLabel(submission.status)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <DetailField label="Email">
              <a
                href={`mailto:${submission.email}`}
                className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                {submission.email}
              </a>
            </DetailField>

            {submission.phone ? (
              <DetailField label="Phone">
                <a
                  href={`tel:${submission.phone}`}
                  className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {submission.phone}
                </a>
              </DetailField>
            ) : null}

            <DetailField label="Message">
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
                {submission.message}
              </p>
            </DetailField>
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <a
            href={`mailto:${submission.email}?subject=Re: Your contact form message`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            Reply by email
          </a>
        </div>
      </aside>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default ContactFormSubmissionsPage;
