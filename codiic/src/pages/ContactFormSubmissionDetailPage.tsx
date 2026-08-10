import { ChevronRightIcon, EnvelopeIcon, InboxIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../components/admin-list-ui';
import {
  useContactFormSubmissions,
  type ContactFormSubmission,
  type ContactFormSubmissionStatus,
} from '../contexts/contact-form-submission.context';
import { useStore } from '../contexts/store.context';

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

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-admin-text-subdued">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ContactFormSubmissionDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading submission">
      <div className="mb-5 h-4 w-56 rounded bg-admin-fill" />
      <div className="mb-4 h-3.5 w-64 rounded bg-admin-secondary" />
      <div className="mb-5 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-admin-fill" />
        <div className="h-5 w-16 rounded-full bg-admin-fill" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-16 rounded-xl border border-admin-border bg-admin-surface" />
        <div className="h-16 rounded-xl border border-admin-border bg-admin-surface" />
        <div className="h-28 rounded-xl border border-admin-border bg-admin-surface" />
      </div>
      <div className="mt-5 h-9 w-full rounded-lg bg-admin-fill sm:w-44" />
    </div>
  );
}

export const ContactFormSubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { activeStoreId } = useStore();
  const { submissions, loading, fetchSubmissionsByStoreId } = useContactFormSubmissions();
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!activeStoreId || !submissionId) {
      setResolved(true);
      return;
    }

    let cancelled = false;
    setResolved(false);

    void (async () => {
      try {
        await fetchSubmissionsByStoreId(activeStoreId);
      } catch {
        if (!cancelled) toast.error('Failed to load contact form submission');
      } finally {
        if (!cancelled) setResolved(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeStoreId, submissionId, fetchSubmissionsByStoreId]);

  const submission = useMemo<ContactFormSubmission | null>(
    () => submissions.find((row) => row._id === submissionId) ?? null,
    [submissions, submissionId]
  );

  if (!submissionId) {
    return (
      <div className={`${adminListPageShellClass} py-8 text-center text-[13px] text-admin-text-secondary`}>
        Submission not found.
      </div>
    );
  }

  const showingSkeleton = (!resolved || loading) && !submission;

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} max-w-3xl py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            <Link
              to="/content/contact-submissions"
              className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}
            >
              <InboxIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Contact submissions
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
            <span className="truncate font-medium text-admin-text">
              {submission?.name || 'Submission'}
            </span>
          </nav>

          <Link to="/content/contact-submissions" className={adminListSecondaryButtonClass}>
            Close
          </Link>
        </div>

        {showingSkeleton ? (
          <ContactFormSubmissionDetailSkeleton />
        ) : !submission ? (
          <div className="rounded-xl border border-admin-border bg-admin-surface px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-admin-text">Submission not found</p>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              It may have been removed, or it belongs to a different store.
            </p>
            <Link
              to="/content/contact-submissions"
              className={`${adminListPrimaryButtonClass} mt-4 inline-flex`}
            >
              Back to submissions
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[13px] text-admin-text-secondary">
              {formatFullDate(submission.createdAt)}
            </p>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-admin-secondary text-[14px] font-semibold text-admin-text-secondary">
                {initials(submission.name)}
              </div>
              <div>
                <h1 className="text-[18px] font-semibold text-admin-text">{submission.name}</h1>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${statusClass(submission.status)}`}
                >
                  {statusLabel(submission.status)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <DetailField label="Email">
                <a
                  href={`mailto:${submission.email}`}
                  className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${adminListFooterLinkClass}`}
                >
                  <EnvelopeIcon className="h-3.5 w-3.5" aria-hidden />
                  {submission.email}
                </a>
              </DetailField>

              {submission.phone ? (
                <DetailField label="Phone">
                  <a
                    href={`tel:${submission.phone}`}
                    className={`text-[13px] font-medium ${adminListFooterLinkClass}`}
                  >
                    {submission.phone}
                  </a>
                </DetailField>
              ) : null}

              <DetailField label="Message">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-admin-text">
                  {submission.message}
                </p>
              </DetailField>
            </div>

            <div className="mt-5">
              <a
                href={`mailto:${submission.email}?subject=Re: Your contact form message`}
                className={`inline-flex w-full justify-center sm:w-auto ${adminListPrimaryButtonClass}`}
              >
                Reply by email
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactFormSubmissionDetailPage;
