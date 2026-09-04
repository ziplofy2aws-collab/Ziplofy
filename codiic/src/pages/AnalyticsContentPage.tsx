import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { type AnalyticsHint } from '../components/analytics/AnalyticsInfoLabel';
import AnalyticsDateRangePicker, {
  type AnalyticsPickerRange,
  type CompareMode,
} from '../components/analytics/AnalyticsDateRangePicker';
import { AnalyticsContentSkeleton } from '../components/analytics/analyticsSkeletonUi';
import {
  AnalyticsCountBarList,
  AnalyticsMetricCard,
  AnalyticsPanelCard,
  analyticsEmptyTextClass,
  formatAnalyticsDelta,
} from '../components/analytics/analyticsSectionUi';
import { formatCount, formatPercent } from '../components/analytics/analyticsChartTheme';
import {
  useAnalytics,
  type AnalyticsContentRecentRow,
} from '../contexts/analytics.context';
import { useStore } from '../contexts/store.context';

const HINTS = {
  newsletterSignups: {
    how: 'Newsletter records whose subscribedAt falls in the selected date range.',
    interpret: 'New list joins this period. Pair with unsubscribes to see whether the list is actually growing.',
  },
  newsletterUnsubs: {
    how: 'Newsletter records whose unsubscribedAt falls in the selected date range.',
    interpret: 'People leaving the list this period. Rising unsubs with flat signups shrinks reach.',
  },
  unsubRate: {
    how: 'Unsubscribes in this range ÷ (signups + unsubscribes in this range).',
    interpret: 'Share of list movements that were unsubs. High rate with few signups means the list is shrinking.',
  },
  netList: {
    how: 'Signups minus unsubscribes in the selected date range. Can be negative.',
    interpret: 'Net list change this period. Negative means more people left than joined.',
  },
  listSize: {
    how: 'Current subscribed newsletter records storewide, not limited to the date range.',
    interpret: 'Live reachable list. Compare with unsubscribed count for overall list health.',
  },
  subscribeRate: {
    how: 'Current subscribed records ÷ all newsletter records storewide.',
    interpret: 'How much of the historical list is still opted in. Low rate means a lot of past unsubs.',
  },
  listMix: {
    how: 'Storewide newsletter records grouped by subscribed vs unsubscribed.',
    interpret: 'Snapshot of list health now, not limited to the date range.',
  },
  movementMix: {
    how: 'Signups vs unsubscribes in the selected date range.',
    interpret: 'Whether the list grew or shrank this period.',
  },
  contactVolume: {
    how: 'Contact form submissions created in the selected date range.',
    interpret: 'Inbound interest / support load. Rising volume without unread catch-up means ops is behind.',
  },
  contactUnread: {
    how: 'Range submissions still in pending status, plus the storewide unread snapshot underneath.',
    interpret: 'Work queue. Storewide unread is the full backlog, not just this period.',
  },
  contactRead: {
    how: 'Range submissions marked read.',
    interpret: 'How much of this period’s inbox has been worked.',
  },
  contactSpam: {
    how: 'Range submissions marked spam, plus the storewide spam snapshot underneath.',
    interpret: 'Noise on the form. A high spam share may mean you need better validation or filtering.',
  },
  contactReadRate: {
    how: 'Read submissions ÷ all submissions in this range.',
    interpret: 'Inbox throughput. Low rate with high volume means the queue is backing up.',
  },
  contactSpamRate: {
    how: 'Spam submissions ÷ all submissions in this range.',
    interpret: 'Form quality. High spam usually needs tighter validation or a captcha.',
  },
  contactPhone: {
    how: 'Range submissions that include a phone number vs those that do not.',
    interpret: 'How often people leave a number. Useful for call-back ops.',
  },
  contactStatus: {
    how: 'Contact form submissions in this range grouped by pending, read, and spam.',
    interpret: 'How quickly the inbox is being worked. Pending should stay small relative to volume.',
  },
  contactStoreStatus: {
    how: 'All store contact submissions grouped by pending, read, and spam. Snapshot now.',
    interpret: 'Full inbox backlog, not just this period.',
  },
  contactRecent: {
    how: 'The latest 8 contact form submissions created in the selected range.',
    interpret: 'Quick ops feed. Unread rows still need a reply.',
  },
  blogPublished: {
    how: 'Blog posts created in this range whose visibility is currently visible.',
    interpret: 'Publishing cadence. Hidden posts created in the same range are drafts.',
  },
  blogCreated: {
    how: 'All blog posts created in the selected date range, visible or hidden.',
    interpret: 'Writing volume. Compare with published to see how much stays in draft.',
  },
  blogPublishRate: {
    how: 'Visible posts created in range ÷ all posts created in range.',
    interpret: 'How much of this period’s writing actually went live.',
  },
  blogVisibleRate: {
    how: 'Currently visible posts ÷ all posts storewide.',
    interpret: 'Live catalog share. A large hidden share usually means unpublished drafts.',
  },
  blogsCount: {
    how: 'Number of blog channels on this store. Snapshot now.',
    interpret: 'How many blogs you run. Comment settings are per blog.',
  },
  featuredImage: {
    how: 'Storewide posts with a featured image URL vs without. Snapshot now.',
    interpret: 'Visual completeness. Posts without an image often underperform on listings.',
  },
  excerpt: {
    how: 'Storewide posts with a non-empty excerpt vs without. Snapshot now.',
    interpret: 'Listing copy coverage. Empty excerpts fall back to truncated body.',
  },
  postTags: {
    how: 'Storewide posts with at least one tag vs none. Snapshot now.',
    interpret: 'How well the catalog is labeled for filtering and related posts.',
  },
  byAuthor: {
    how: 'Storewide posts grouped by author name. Empty author is Unspecified.',
    interpret: 'Who is publishing. Concentration on one author is a single-writer risk.',
  },
  byTag: {
    how: 'Storewide posts unwound across tags. A post with 3 tags counts in all 3.',
    interpret: 'Which topics you write about. Do not sum these into total posts.',
  },
  blogVisibility: {
    how: 'Storewide posts grouped by visible vs hidden. Snapshot now.',
    interpret: 'Live vs draft catalog.',
  },
  rangeVisibility: {
    how: 'Posts created in this range grouped by current visible vs hidden.',
    interpret: 'What this period produced that is actually live.',
  },
  commentMode: {
    how: 'Blog channels grouped by comments setting: disabled, moderated, or allowed.',
    interpret: 'How open discussion is. Disabled blogs will not collect comments.',
  },
  recentPosts: {
    how: 'The latest 8 blog posts created in the selected range.',
    interpret: 'Recent publishing activity.',
  },
  blogComments: {
    how: 'Blog comments created in the selected date range, all statuses.',
    interpret: 'Engagement on articles. Pair with pending moderation to see review load.',
  },
  commentsPublished: {
    how: 'Range comments currently published.',
    interpret: 'Live discussion volume this period.',
  },
  commentsPending: {
    how: 'Range comments still pending, plus the storewide pending snapshot underneath.',
    interpret: 'Moderation queue. Storewide pending is the full backlog.',
  },
  commentSpamRate: {
    how: 'Spam comments ÷ all comments in this range.',
    interpret: 'Noise on the comment form. High spam may need tighter checks.',
  },
  commentStatus: {
    how: 'Blog comments in this range grouped by pending, published, and spam.',
    interpret: 'Quality of discussion this period.',
  },
  commentStoreStatus: {
    how: 'All store comments grouped by pending, published, and spam. Snapshot now.',
    interpret: 'Full moderation backlog, not just this period.',
  },
  topArticles: {
    how: 'Posts ranked by comment count in the selected date range.',
    interpret: 'Which articles drew conversation this period.',
  },
  pagesPublished: {
    how: 'Store pages created in this range whose visibility is currently visible.',
    interpret: 'Content site growth. Hidden pages created in the same range are drafts.',
  },
  pagesCreated: {
    how: 'All store pages created in the selected date range, visible or hidden.',
    interpret: 'Page-building volume this period.',
  },
  pagesPublishRate: {
    how: 'Visible pages created in range ÷ all pages created in range.',
    interpret: 'How much of this period’s page work went live.',
  },
  pagesVisibleRate: {
    how: 'Currently visible pages ÷ all pages storewide.',
    interpret: 'Live site share. Hidden pages are drafts or unpublished.',
  },
  seoTitle: {
    how: 'Storewide pages with a non-empty SEO page title vs without. Snapshot now.',
    interpret: 'Search snippet coverage. Empty titles fall back to the page title.',
  },
  metaDescription: {
    how: 'Storewide pages with a non-empty meta description vs without. Snapshot now.',
    interpret: 'Search result copy. Empty meta usually looks weaker in Google.',
  },
  pageContent: {
    how: 'Storewide pages with non-empty body content vs empty. Snapshot now.',
    interpret: 'Placeholder / empty pages. Empty content should not stay visible.',
  },
  themeMix: {
    how: 'Storewide pages grouped by theme template. Snapshot now.',
    interpret: 'Which page templates you actually use.',
  },
  pageVisibility: {
    how: 'Storewide pages grouped by visible vs hidden. Snapshot now.',
    interpret: 'Live vs draft pages.',
  },
  recentPages: {
    how: 'The latest 8 store pages created in the selected range.',
    interpret: 'Recent page-building activity.',
  },
} as const satisfies Record<string, AnalyticsHint>;

function statusLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-admin-text">{title}</h2>
      {children}
    </section>
  );
}

function RecentTable({
  rows,
  empty,
  statusKind,
}: {
  rows: AnalyticsContentRecentRow[];
  empty: string;
  statusKind: 'contact' | 'visibility';
}) {
  if (rows.length === 0) return <p className={analyticsEmptyTextClass}>{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[13px]">
        <thead>
          <tr className="text-[12px] text-admin-text-secondary">
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Detail</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 text-right font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-admin-divider">
              <td className="py-2.5 font-medium text-admin-text">{row.title}</td>
              <td className="py-2.5 text-admin-text-secondary">{row.subtitle || '—'}</td>
              <td className="py-2.5 capitalize text-admin-text-secondary">
                {statusKind === 'visibility' && row.status === 'visible'
                  ? 'Visible'
                  : statusKind === 'visibility' && row.status === 'hidden'
                    ? 'Hidden'
                    : statusLabel(row.status)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-admin-text">{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const AnalyticsContentPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const {
    contentInsights,
    compareContentInsights,
    range,
    compareRange,
    error,
    setRange,
    setCompare,
    fetchContentInsights,
  } = useAnalytics();
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleRangeChange = useCallback(
    (pickerRange: AnalyticsPickerRange) => {
      setRange({ from: pickerRange.start, to: pickerRange.end });
    },
    [setRange],
  );

  const handleCompareChange = useCallback(
    (payload: { mode: CompareMode; range: AnalyticsPickerRange | null }) => {
      setCompare({
        mode: payload.mode,
        range: payload.range
          ? { from: payload.range.start, to: payload.range.end }
          : null,
      });
    },
    [setCompare],
  );

  useEffect(() => {
    if (!activeStoreId || !range) return;
    void fetchContentInsights(activeStoreId, range)
      .catch(() => {
        /* error is stored on analytics context */
      })
      .finally(() => {
        setHasLoaded(true);
      });
  }, [activeStoreId, range, compareRange, fetchContentInsights]);

  const newsletter = contentInsights.newsletter;
  const compareNewsletter = compareContentInsights?.newsletter;
  const contact = contentInsights.contactForm;
  const compareContact = compareContentInsights?.contactForm;
  const posts = contentInsights.blogPosts;
  const comparePosts = compareContentInsights?.blogPosts;
  const comments = contentInsights.blogComments;
  const compareComments = compareContentInsights?.blogComments;
  const pages = contentInsights.pages;
  const comparePages = compareContentInsights?.pages;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1000px] pb-8">
        <header className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              Content / CRM analytics
            </h1>
          </div>
          <p className="mb-3 text-[13px] text-admin-text-secondary">
            Newsletter list health, contact inbox, blog publishing and comments, and store pages.
          </p>
          <AnalyticsDateRangePicker
            onRangeChange={handleRangeChange}
            onCompareChange={handleCompareChange}
          />
          {error ? (
            <p className="mt-2 text-[12px] text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </header>

        {!hasLoaded ? (
          <AnalyticsContentSkeleton />
        ) : (
          <>
            <ContentSection title="Newsletter">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Signups"
                  hint={HINTS.newsletterSignups}
                  value={formatCount(newsletter.signups)}
                  delta={formatAnalyticsDelta(newsletter.signups, compareNewsletter?.signups)}
                />
                <AnalyticsMetricCard
                  title="Unsubscribes"
                  hint={HINTS.newsletterUnsubs}
                  value={formatCount(newsletter.unsubscribes)}
                  delta={formatAnalyticsDelta(
                    newsletter.unsubscribes,
                    compareNewsletter?.unsubscribes,
                  )}
                />
                <AnalyticsMetricCard
                  title="Net list"
                  hint={HINTS.netList}
                  value={formatCount(newsletter.netList)}
                  delta={formatAnalyticsDelta(newsletter.netList, compareNewsletter?.netList)}
                />
                <AnalyticsMetricCard
                  title="Unsub rate"
                  hint={HINTS.unsubRate}
                  value={formatPercent(newsletter.unsubRate)}
                  delta={formatAnalyticsDelta(newsletter.unsubRate, compareNewsletter?.unsubRate)}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AnalyticsMetricCard
                  title="List size"
                  hint={HINTS.listSize}
                  value={formatCount(newsletter.storeSubscribed)}
                  delta={`${formatCount(newsletter.storeUnsubscribed)} unsubscribed`}
                />
                <AnalyticsMetricCard
                  title="Still subscribed"
                  hint={HINTS.subscribeRate}
                  value={formatPercent(newsletter.subscribeRate)}
                  delta={`${formatCount(newsletter.storeTotal)} total records`}
                />
                <AnalyticsMetricCard
                  title="Store unsubscribed"
                  hint={HINTS.listMix}
                  value={formatCount(newsletter.storeUnsubscribed)}
                  delta="now"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <AnalyticsPanelCard title="List status now" hint={HINTS.listMix}>
                  <AnalyticsCountBarList
                    rows={newsletter.listMix}
                    empty="No newsletter records yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="List movement this range" hint={HINTS.movementMix}>
                  <AnalyticsCountBarList
                    rows={newsletter.movementMix}
                    empty="No list movement in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
              </div>
            </ContentSection>

            <ContentSection title="Contact forms">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Volume"
                  hint={HINTS.contactVolume}
                  value={formatCount(contact.volume)}
                  delta={formatAnalyticsDelta(contact.volume, compareContact?.volume)}
                />
                <AnalyticsMetricCard
                  title="Unread"
                  hint={HINTS.contactUnread}
                  value={formatCount(contact.unread)}
                  delta={formatAnalyticsDelta(contact.unread, compareContact?.unread)}
                />
                <AnalyticsMetricCard
                  title="Read"
                  hint={HINTS.contactRead}
                  value={formatCount(contact.read)}
                  delta={formatAnalyticsDelta(contact.read, compareContact?.read)}
                />
                <AnalyticsMetricCard
                  title="Spam"
                  hint={HINTS.contactSpam}
                  value={formatCount(contact.spam)}
                  delta={formatAnalyticsDelta(contact.spam, compareContact?.spam)}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Read rate"
                  hint={HINTS.contactReadRate}
                  value={formatPercent(contact.readRate)}
                  delta={formatAnalyticsDelta(contact.readRate, compareContact?.readRate)}
                />
                <AnalyticsMetricCard
                  title="Spam rate"
                  hint={HINTS.contactSpamRate}
                  value={formatPercent(contact.spamRate)}
                  delta={formatAnalyticsDelta(contact.spamRate, compareContact?.spamRate)}
                />
                <AnalyticsMetricCard
                  title="With phone"
                  hint={HINTS.contactPhone}
                  value={formatCount(contact.withPhone)}
                  delta={`${formatCount(contact.withoutPhone)} without`}
                />
                <AnalyticsMetricCard
                  title="Store unread"
                  hint={HINTS.contactUnread}
                  value={formatCount(contact.storeUnread)}
                  delta={`${formatCount(contact.storeTotal)} total`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard title="Status this range" hint={HINTS.contactStatus}>
                  <AnalyticsCountBarList
                    rows={contact.statusMix}
                    empty="No contact submissions in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Inbox now" hint={HINTS.contactStoreStatus}>
                  <AnalyticsCountBarList
                    rows={contact.storeStatusMix}
                    empty="No contact submissions yet"
                    loading={false}
                  />
                  <p className="mt-3 text-[12px] text-admin-text-subdued">
                    Storewide {formatCount(contact.storeUnread)} unread · {formatCount(contact.storeSpam)}{' '}
                    spam · {formatCount(contact.storeRead)} read
                  </p>
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Phone left on form" hint={HINTS.contactPhone}>
                  <AnalyticsCountBarList
                    rows={contact.phoneMix}
                    empty="No contact submissions in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <AnalyticsPanelCard title="Recent submissions" hint={HINTS.contactRecent}>
                  <RecentTable
                    rows={contact.recent}
                    empty="No contact submissions in this date range"
                    statusKind="contact"
                  />
                </AnalyticsPanelCard>
              </div>
            </ContentSection>

            <ContentSection title="Blog">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Posts published"
                  hint={HINTS.blogPublished}
                  value={formatCount(posts.published)}
                  delta={formatAnalyticsDelta(posts.published, comparePosts?.published)}
                />
                <AnalyticsMetricCard
                  title="Posts created"
                  hint={HINTS.blogCreated}
                  value={formatCount(posts.created)}
                  delta={formatAnalyticsDelta(posts.created, comparePosts?.created)}
                />
                <AnalyticsMetricCard
                  title="Publish rate"
                  hint={HINTS.blogPublishRate}
                  value={formatPercent(posts.publishRate)}
                  delta={formatAnalyticsDelta(posts.publishRate, comparePosts?.publishRate)}
                />
                <AnalyticsMetricCard
                  title="Visible now"
                  hint={HINTS.blogVisibleRate}
                  value={formatPercent(posts.visibleRate)}
                  delta={`${formatCount(posts.storeVisible)} / ${formatCount(posts.storeTotal)}`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Blogs"
                  hint={HINTS.blogsCount}
                  value={formatCount(posts.blogs)}
                  delta="now"
                />
                <AnalyticsMetricCard
                  title="With featured image"
                  hint={HINTS.featuredImage}
                  value={formatCount(posts.withFeaturedImage)}
                  delta={`${formatCount(posts.withoutFeaturedImage)} without`}
                />
                <AnalyticsMetricCard
                  title="With excerpt"
                  hint={HINTS.excerpt}
                  value={formatCount(posts.withExcerpt)}
                  delta={`${formatCount(posts.withoutExcerpt)} without`}
                />
                <AnalyticsMetricCard
                  title="Tagged posts"
                  hint={HINTS.postTags}
                  value={formatCount(posts.withTags)}
                  delta={`${formatCount(posts.withoutTags)} untagged`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard title="Visibility now" hint={HINTS.blogVisibility}>
                  <AnalyticsCountBarList
                    rows={posts.visibilityMix}
                    empty="No blog posts yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Created this range" hint={HINTS.rangeVisibility}>
                  <AnalyticsCountBarList
                    rows={posts.rangeVisibilityMix}
                    empty="No posts created in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Comment settings" hint={HINTS.commentMode}>
                  <AnalyticsCountBarList
                    rows={posts.commentModeMix}
                    empty="No blogs yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <AnalyticsPanelCard title="Posts by author" hint={HINTS.byAuthor}>
                  <AnalyticsCountBarList
                    rows={posts.byAuthor}
                    empty="No authors yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Posts by tag" hint={HINTS.byTag}>
                  <AnalyticsCountBarList
                    rows={posts.byTag}
                    empty="No tagged posts yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <AnalyticsPanelCard title="Recent posts" hint={HINTS.recentPosts}>
                  <RecentTable
                    rows={posts.recent}
                    empty="No blog posts created in this date range"
                    statusKind="visibility"
                  />
                </AnalyticsPanelCard>
              </div>

              <h3 className="mb-3 mt-6 text-[13px] font-semibold text-admin-text">Comments</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Comments"
                  hint={HINTS.blogComments}
                  value={formatCount(comments.total)}
                  delta={formatAnalyticsDelta(comments.total, compareComments?.total)}
                />
                <AnalyticsMetricCard
                  title="Published"
                  hint={HINTS.commentsPublished}
                  value={formatCount(comments.published)}
                  delta={formatAnalyticsDelta(comments.published, compareComments?.published)}
                />
                <AnalyticsMetricCard
                  title="Pending moderation"
                  hint={HINTS.commentsPending}
                  value={formatCount(comments.pending)}
                  delta={`${formatCount(comments.storePending)} storewide`}
                />
                <AnalyticsMetricCard
                  title="Spam rate"
                  hint={HINTS.commentSpamRate}
                  value={formatPercent(comments.spamRate)}
                  delta={formatAnalyticsDelta(comments.spamRate, compareComments?.spamRate)}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard title="Comments this range" hint={HINTS.commentStatus}>
                  <AnalyticsCountBarList
                    rows={comments.statusMix}
                    empty="No blog comments in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Moderation now" hint={HINTS.commentStoreStatus}>
                  <AnalyticsCountBarList
                    rows={comments.storeStatusMix}
                    empty="No blog comments yet"
                    loading={false}
                  />
                  <p className="mt-3 text-[12px] text-admin-text-subdued">
                    Storewide {formatCount(comments.storePending)} pending ·{' '}
                    {formatCount(comments.storePublished)} published · {formatCount(comments.storeSpam)} spam
                  </p>
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Most commented posts" hint={HINTS.topArticles}>
                  {comments.topArticles.length === 0 ? (
                    <p className={analyticsEmptyTextClass}>No comments in this date range</p>
                  ) : (
                    <ul className="space-y-2">
                      {comments.topArticles.map((row) => (
                        <li key={row.articleId} className="flex items-center justify-between gap-3">
                          <p className="truncate text-[13px] text-admin-text" title={row.title}>
                            {row.title}
                          </p>
                          <span className="shrink-0 tabular-nums text-[12px] text-admin-text-secondary">
                            {formatCount(row.comments)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AnalyticsPanelCard>
              </div>
            </ContentSection>

            <ContentSection title="Pages">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AnalyticsMetricCard
                  title="Pages published"
                  hint={HINTS.pagesPublished}
                  value={formatCount(pages.published)}
                  delta={formatAnalyticsDelta(pages.published, comparePages?.published)}
                />
                <AnalyticsMetricCard
                  title="Pages created"
                  hint={HINTS.pagesCreated}
                  value={formatCount(pages.created)}
                  delta={formatAnalyticsDelta(pages.created, comparePages?.created)}
                />
                <AnalyticsMetricCard
                  title="Publish rate"
                  hint={HINTS.pagesPublishRate}
                  value={formatPercent(pages.publishRate)}
                  delta={formatAnalyticsDelta(pages.publishRate, comparePages?.publishRate)}
                />
                <AnalyticsMetricCard
                  title="Visible now"
                  hint={HINTS.pagesVisibleRate}
                  value={formatPercent(pages.visibleRate)}
                  delta={`${formatCount(pages.storeVisible)} / ${formatCount(pages.storeTotal)}`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AnalyticsMetricCard
                  title="SEO title set"
                  hint={HINTS.seoTitle}
                  value={formatCount(pages.withSeoTitle)}
                  delta={`${formatCount(pages.withoutSeoTitle)} missing`}
                />
                <AnalyticsMetricCard
                  title="Meta description"
                  hint={HINTS.metaDescription}
                  value={formatCount(pages.withMetaDescription)}
                  delta={`${formatCount(pages.withoutMetaDescription)} missing`}
                />
                <AnalyticsMetricCard
                  title="Has content"
                  hint={HINTS.pageContent}
                  value={formatCount(pages.withContent)}
                  delta={`${formatCount(pages.withoutContent)} empty`}
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <AnalyticsPanelCard title="Visibility now" hint={HINTS.pageVisibility}>
                  <AnalyticsCountBarList
                    rows={pages.visibilityMix}
                    empty="No pages yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Created this range" hint={HINTS.rangeVisibility}>
                  <AnalyticsCountBarList
                    rows={pages.rangeVisibilityMix}
                    empty="No pages created in this range"
                    loading={false}
                  />
                </AnalyticsPanelCard>
                <AnalyticsPanelCard title="Theme templates" hint={HINTS.themeMix}>
                  <AnalyticsCountBarList
                    rows={pages.themeMix}
                    empty="No pages yet"
                    loading={false}
                  />
                </AnalyticsPanelCard>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <AnalyticsPanelCard title="Recent pages" hint={HINTS.recentPages}>
                  <RecentTable
                    rows={pages.recent}
                    empty="No pages created in this date range"
                    statusKind="visibility"
                  />
                </AnalyticsPanelCard>
              </div>
            </ContentSection>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsContentPage;
