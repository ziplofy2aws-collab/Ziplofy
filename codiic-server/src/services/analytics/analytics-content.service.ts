import mongoose, { Types } from 'mongoose';
import { ContactFormSubmission, NewsletterSubscription, StorePage } from '../../models';
import { Blog } from '../../models/blog/blog.model';
import { BlogComment } from '../../models/blog-comment/blog-comment.model';
import { BlogPost } from '../../models/blog-post/blog-post.model';
import { BlogTags } from '../../models/blog-tags/blog-tags.model';
import { CustomError } from '../../utils/error.utils';
import {
  assertValidAnalyticsRange,
  type AnalyticsRangeQuery,
} from './analytics-summary.service';

export type AnalyticsNamedCount = {
  key: string;
  name: string;
  value: number;
};

export type AnalyticsContentRecentRow = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
};

export type AnalyticsContentArticleRow = {
  articleId: string;
  title: string;
  comments: number;
};

export type AnalyticsContentInsights = {
  newsletter: {
    signups: number;
    unsubscribes: number;
    netList: number;
    unsubRate: number;
    subscribeRate: number;
    storeSubscribed: number;
    storeUnsubscribed: number;
    storeTotal: number;
    listMix: AnalyticsNamedCount[];
    movementMix: AnalyticsNamedCount[];
  };
  contactForm: {
    volume: number;
    unread: number;
    spam: number;
    read: number;
    spamRate: number;
    readRate: number;
    unreadRate: number;
    withPhone: number;
    withoutPhone: number;
    storeUnread: number;
    storeRead: number;
    storeSpam: number;
    storeTotal: number;
    statusMix: AnalyticsNamedCount[];
    storeStatusMix: AnalyticsNamedCount[];
    phoneMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
  blogPosts: {
    blogs: number;
    published: number;
    created: number;
    hidden: number;
    publishRate: number;
    visibleRate: number;
    storeVisible: number;
    storeHidden: number;
    storeTotal: number;
    withFeaturedImage: number;
    withoutFeaturedImage: number;
    withExcerpt: number;
    withoutExcerpt: number;
    withTags: number;
    withoutTags: number;
    byAuthor: AnalyticsNamedCount[];
    byTag: AnalyticsNamedCount[];
    visibilityMix: AnalyticsNamedCount[];
    rangeVisibilityMix: AnalyticsNamedCount[];
    commentModeMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
  blogComments: {
    total: number;
    pending: number;
    published: number;
    spam: number;
    pendingRate: number;
    publishRate: number;
    spamRate: number;
    storePending: number;
    storePublished: number;
    storeSpam: number;
    storeTotal: number;
    statusMix: AnalyticsNamedCount[];
    storeStatusMix: AnalyticsNamedCount[];
    topArticles: AnalyticsContentArticleRow[];
  };
  pages: {
    published: number;
    created: number;
    hidden: number;
    publishRate: number;
    visibleRate: number;
    storeVisible: number;
    storeHidden: number;
    storeTotal: number;
    withSeoTitle: number;
    withoutSeoTitle: number;
    withMetaDescription: number;
    withoutMetaDescription: number;
    withContent: number;
    withoutContent: number;
    themeMix: AnalyticsNamedCount[];
    visibilityMix: AnalyticsNamedCount[];
    rangeVisibilityMix: AnalyticsNamedCount[];
    recent: AnalyticsContentRecentRow[];
  };
};

function assertStoreId(storeId: string): Types.ObjectId {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  return new Types.ObjectId(storeId);
}

function roundRate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 1000) / 1000;
}

function namedCount(key: string, name: string, value: number): AnalyticsNamedCount {
  return { key, name, value: Number(value) || 0 };
}

function statusMix(
  counts: Record<string, number>,
  labels: Array<{ key: string; name: string }>,
): AnalyticsNamedCount[] {
  return labels
    .map((label) => namedCount(label.key, label.name, counts[label.key] ?? 0))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}

function nonEmptyString(field: string) {
  return { [field]: { $exists: true, $nin: [null, ''] } };
}

export async function getStoreContentAnalytics(
  query: AnalyticsRangeQuery,
): Promise<AnalyticsContentInsights> {
  const storeObjectId = assertStoreId(query.storeId);
  assertValidAnalyticsRange(query.from, query.to);
  const { from, to } = query;
  const storeFilter = { storeId: storeObjectId };
  const createdInRange = { createdAt: { $gte: from, $lte: to } };

  const [
    newsletterSignups,
    newsletterUnsubs,
    newsletterSubscribed,
    newsletterUnsubscribed,
    newsletterTotal,
    contactVolume,
    contactUnread,
    contactSpam,
    contactRead,
    contactWithPhone,
    contactStoreUnread,
    contactStoreRead,
    contactStoreSpam,
    contactStoreTotal,
    contactRecent,
    postsCreated,
    postsPublished,
    postsHidden,
    postsStoreVisible,
    postsStoreHidden,
    postsStoreTotal,
    postsWithImage,
    postsWithExcerpt,
    postsWithTags,
    postsByAuthor,
    postsByTag,
    postsRecent,
    blogsCount,
    blogCommentModes,
    commentsTotal,
    commentsPending,
    commentsPublished,
    commentsSpam,
    commentsStorePending,
    commentsStorePublished,
    commentsStoreSpam,
    commentsStoreTotal,
    commentsTopArticles,
    pagesCreated,
    pagesPublished,
    pagesHidden,
    pagesStoreVisible,
    pagesStoreHidden,
    pagesStoreTotal,
    pagesWithSeoTitle,
    pagesWithMeta,
    pagesWithContent,
    pagesThemeMix,
    pagesRecent,
  ] = await Promise.all([
    NewsletterSubscription.countDocuments({
      ...storeFilter,
      subscribedAt: { $gte: from, $lte: to },
    }),
    NewsletterSubscription.countDocuments({
      ...storeFilter,
      unsubscribedAt: { $gte: from, $lte: to },
    }),
    NewsletterSubscription.countDocuments({ ...storeFilter, status: 'subscribed' }),
    NewsletterSubscription.countDocuments({ ...storeFilter, status: 'unsubscribed' }),
    NewsletterSubscription.countDocuments(storeFilter),
    ContactFormSubmission.countDocuments({ ...storeFilter, ...createdInRange }),
    ContactFormSubmission.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'pending',
    }),
    ContactFormSubmission.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'spam',
    }),
    ContactFormSubmission.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'read',
    }),
    ContactFormSubmission.countDocuments({
      ...storeFilter,
      ...createdInRange,
      ...nonEmptyString('phone'),
    }),
    ContactFormSubmission.countDocuments({ ...storeFilter, status: 'pending' }),
    ContactFormSubmission.countDocuments({ ...storeFilter, status: 'read' }),
    ContactFormSubmission.countDocuments({ ...storeFilter, status: 'spam' }),
    ContactFormSubmission.countDocuments(storeFilter),
    ContactFormSubmission.find({ ...storeFilter, ...createdInRange })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name email status createdAt')
      .lean(),
    BlogPost.countDocuments({ ...storeFilter, ...createdInRange }),
    BlogPost.countDocuments({
      ...storeFilter,
      ...createdInRange,
      visibility: 'visible',
    }),
    BlogPost.countDocuments({
      ...storeFilter,
      ...createdInRange,
      visibility: 'hidden',
    }),
    BlogPost.countDocuments({ ...storeFilter, visibility: 'visible' }),
    BlogPost.countDocuments({ ...storeFilter, visibility: 'hidden' }),
    BlogPost.countDocuments(storeFilter),
    BlogPost.countDocuments({ ...storeFilter, ...nonEmptyString('featuredImageUrl') }),
    BlogPost.countDocuments({ ...storeFilter, ...nonEmptyString('excerpt') }),
    BlogPost.countDocuments({
      ...storeFilter,
      'tagIds.0': { $exists: true },
    }),
    BlogPost.aggregate<{ _id: string; value: number }>([
      { $match: storeFilter },
      {
        $group: {
          _id: {
            $let: {
              vars: { author: { $trim: { input: { $ifNull: ['$author', ''] } } } },
              in: { $cond: [{ $eq: ['$$author', ''] }, 'Unspecified', '$$author'] },
            },
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),
    BlogPost.aggregate<{ _id: Types.ObjectId; value: number; name?: string }>([
      { $match: { ...storeFilter, tagIds: { $exists: true, $ne: [] } } },
      { $unwind: '$tagIds' },
      { $group: { _id: '$tagIds', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: BlogTags.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'tag',
        },
      },
      { $unwind: { path: '$tag', preserveNullAndEmptyArrays: true } },
      { $project: { value: 1, name: '$tag.name' } },
    ]),
    BlogPost.find({ ...storeFilter, ...createdInRange })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('title author visibility createdAt')
      .lean(),
    Blog.countDocuments(storeFilter),
    Blog.aggregate<{ _id: string; value: number }>([
      { $match: storeFilter },
      { $group: { _id: { $ifNull: ['$comments', 'disabled'] }, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
    BlogComment.countDocuments({ ...storeFilter, ...createdInRange }),
    BlogComment.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'pending',
    }),
    BlogComment.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'published',
    }),
    BlogComment.countDocuments({
      ...storeFilter,
      ...createdInRange,
      status: 'spam',
    }),
    BlogComment.countDocuments({ ...storeFilter, status: 'pending' }),
    BlogComment.countDocuments({ ...storeFilter, status: 'published' }),
    BlogComment.countDocuments({ ...storeFilter, status: 'spam' }),
    BlogComment.countDocuments(storeFilter),
    BlogComment.aggregate<{ _id: Types.ObjectId; comments: number; title?: string }>([
      { $match: { ...storeFilter, ...createdInRange } },
      { $group: { _id: '$articleId', comments: { $sum: 1 } } },
      { $sort: { comments: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: BlogPost.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: { path: '$post', preserveNullAndEmptyArrays: true } },
      { $project: { comments: 1, title: '$post.title' } },
    ]),
    StorePage.countDocuments({ ...storeFilter, ...createdInRange }),
    StorePage.countDocuments({
      ...storeFilter,
      ...createdInRange,
      visibility: 'visible',
    }),
    StorePage.countDocuments({
      ...storeFilter,
      ...createdInRange,
      visibility: 'hidden',
    }),
    StorePage.countDocuments({ ...storeFilter, visibility: 'visible' }),
    StorePage.countDocuments({ ...storeFilter, visibility: 'hidden' }),
    StorePage.countDocuments(storeFilter),
    StorePage.countDocuments({ ...storeFilter, ...nonEmptyString('pageTitle') }),
    StorePage.countDocuments({ ...storeFilter, ...nonEmptyString('metaDescription') }),
    StorePage.countDocuments({ ...storeFilter, ...nonEmptyString('content') }),
    StorePage.aggregate<{ _id: string; value: number }>([
      { $match: storeFilter },
      {
        $group: {
          _id: {
            $let: {
              vars: { theme: { $trim: { input: { $ifNull: ['$themeTemplate', 'default'] } } } },
              in: { $cond: [{ $eq: ['$$theme', ''] }, 'default', '$$theme'] },
            },
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),
    StorePage.find({ ...storeFilter, ...createdInRange })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('title visibility createdAt')
      .lean(),
  ]);

  const listEvents = newsletterSignups + newsletterUnsubs;
  const contactWithoutPhone = Math.max(contactVolume - contactWithPhone, 0);

  const commentModeLabels: Record<string, string> = {
    disabled: 'Comments disabled',
    moderated: 'Moderated',
    allowed: 'Allowed',
  };

  return {
    newsletter: {
      signups: newsletterSignups,
      unsubscribes: newsletterUnsubs,
      netList: newsletterSignups - newsletterUnsubs,
      unsubRate: roundRate(listEvents > 0 ? newsletterUnsubs / listEvents : 0),
      subscribeRate: roundRate(
        newsletterTotal > 0 ? newsletterSubscribed / newsletterTotal : 0,
      ),
      storeSubscribed: newsletterSubscribed,
      storeUnsubscribed: newsletterUnsubscribed,
      storeTotal: newsletterTotal,
      listMix: statusMix(
        { subscribed: newsletterSubscribed, unsubscribed: newsletterUnsubscribed },
        [
          { key: 'subscribed', name: 'Subscribed' },
          { key: 'unsubscribed', name: 'Unsubscribed' },
        ],
      ),
      movementMix: statusMix(
        { signups: newsletterSignups, unsubscribes: newsletterUnsubs },
        [
          { key: 'signups', name: 'Signups' },
          { key: 'unsubscribes', name: 'Unsubscribes' },
        ],
      ),
    },
    contactForm: {
      volume: contactVolume,
      unread: contactUnread,
      spam: contactSpam,
      read: contactRead,
      spamRate: roundRate(contactVolume > 0 ? contactSpam / contactVolume : 0),
      readRate: roundRate(contactVolume > 0 ? contactRead / contactVolume : 0),
      unreadRate: roundRate(contactVolume > 0 ? contactUnread / contactVolume : 0),
      withPhone: contactWithPhone,
      withoutPhone: contactWithoutPhone,
      storeUnread: contactStoreUnread,
      storeRead: contactStoreRead,
      storeSpam: contactStoreSpam,
      storeTotal: contactStoreTotal,
      statusMix: statusMix(
        { pending: contactUnread, read: contactRead, spam: contactSpam },
        [
          { key: 'pending', name: 'Unread' },
          { key: 'read', name: 'Read' },
          { key: 'spam', name: 'Spam' },
        ],
      ),
      storeStatusMix: statusMix(
        { pending: contactStoreUnread, read: contactStoreRead, spam: contactStoreSpam },
        [
          { key: 'pending', name: 'Unread' },
          { key: 'read', name: 'Read' },
          { key: 'spam', name: 'Spam' },
        ],
      ),
      phoneMix: statusMix(
        { withPhone: contactWithPhone, withoutPhone: contactWithoutPhone },
        [
          { key: 'withPhone', name: 'With phone' },
          { key: 'withoutPhone', name: 'No phone' },
        ],
      ),
      recent: contactRecent.map((row) => ({
        id: String(row._id),
        title: row.name || 'Unknown',
        subtitle: row.email || '',
        status: row.status || 'pending',
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      })),
    },
    blogPosts: {
      blogs: blogsCount,
      published: postsPublished,
      created: postsCreated,
      hidden: postsHidden,
      publishRate: roundRate(postsCreated > 0 ? postsPublished / postsCreated : 0),
      visibleRate: roundRate(postsStoreTotal > 0 ? postsStoreVisible / postsStoreTotal : 0),
      storeVisible: postsStoreVisible,
      storeHidden: postsStoreHidden,
      storeTotal: postsStoreTotal,
      withFeaturedImage: postsWithImage,
      withoutFeaturedImage: Math.max(postsStoreTotal - postsWithImage, 0),
      withExcerpt: postsWithExcerpt,
      withoutExcerpt: Math.max(postsStoreTotal - postsWithExcerpt, 0),
      withTags: postsWithTags,
      withoutTags: Math.max(postsStoreTotal - postsWithTags, 0),
      byAuthor: postsByAuthor.map((row) =>
        namedCount(String(row._id), String(row._id), row.value),
      ),
      byTag: postsByTag.map((row) =>
        namedCount(String(row._id), row.name?.trim() || 'Untitled tag', row.value),
      ),
      visibilityMix: statusMix(
        { visible: postsStoreVisible, hidden: postsStoreHidden },
        [
          { key: 'visible', name: 'Visible' },
          { key: 'hidden', name: 'Hidden' },
        ],
      ),
      rangeVisibilityMix: statusMix(
        { visible: postsPublished, hidden: postsHidden },
        [
          { key: 'visible', name: 'Published' },
          { key: 'hidden', name: 'Hidden / draft' },
        ],
      ),
      commentModeMix: blogCommentModes.map((row) =>
        namedCount(
          String(row._id),
          commentModeLabels[String(row._id)] || String(row._id),
          row.value,
        ),
      ),
      recent: postsRecent.map((row) => ({
        id: String(row._id),
        title: row.title || 'Untitled post',
        subtitle: row.author?.trim() || 'No author',
        status: row.visibility || 'hidden',
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      })),
    },
    blogComments: {
      total: commentsTotal,
      pending: commentsPending,
      published: commentsPublished,
      spam: commentsSpam,
      pendingRate: roundRate(commentsTotal > 0 ? commentsPending / commentsTotal : 0),
      publishRate: roundRate(commentsTotal > 0 ? commentsPublished / commentsTotal : 0),
      spamRate: roundRate(commentsTotal > 0 ? commentsSpam / commentsTotal : 0),
      storePending: commentsStorePending,
      storePublished: commentsStorePublished,
      storeSpam: commentsStoreSpam,
      storeTotal: commentsStoreTotal,
      statusMix: statusMix(
        { pending: commentsPending, published: commentsPublished, spam: commentsSpam },
        [
          { key: 'pending', name: 'Pending' },
          { key: 'published', name: 'Published' },
          { key: 'spam', name: 'Spam' },
        ],
      ),
      storeStatusMix: statusMix(
        {
          pending: commentsStorePending,
          published: commentsStorePublished,
          spam: commentsStoreSpam,
        },
        [
          { key: 'pending', name: 'Pending' },
          { key: 'published', name: 'Published' },
          { key: 'spam', name: 'Spam' },
        ],
      ),
      topArticles: commentsTopArticles.map((row) => ({
        articleId: String(row._id),
        title: row.title?.trim() || 'Deleted or untitled post',
        comments: Number(row.comments) || 0,
      })),
    },
    pages: {
      published: pagesPublished,
      created: pagesCreated,
      hidden: pagesHidden,
      publishRate: roundRate(pagesCreated > 0 ? pagesPublished / pagesCreated : 0),
      visibleRate: roundRate(pagesStoreTotal > 0 ? pagesStoreVisible / pagesStoreTotal : 0),
      storeVisible: pagesStoreVisible,
      storeHidden: pagesStoreHidden,
      storeTotal: pagesStoreTotal,
      withSeoTitle: pagesWithSeoTitle,
      withoutSeoTitle: Math.max(pagesStoreTotal - pagesWithSeoTitle, 0),
      withMetaDescription: pagesWithMeta,
      withoutMetaDescription: Math.max(pagesStoreTotal - pagesWithMeta, 0),
      withContent: pagesWithContent,
      withoutContent: Math.max(pagesStoreTotal - pagesWithContent, 0),
      themeMix: pagesThemeMix.map((row) =>
        namedCount(String(row._id), String(row._id), row.value),
      ),
      visibilityMix: statusMix(
        { visible: pagesStoreVisible, hidden: pagesStoreHidden },
        [
          { key: 'visible', name: 'Visible' },
          { key: 'hidden', name: 'Hidden' },
        ],
      ),
      rangeVisibilityMix: statusMix(
        { visible: pagesPublished, hidden: pagesHidden },
        [
          { key: 'visible', name: 'Published' },
          { key: 'hidden', name: 'Hidden / draft' },
        ],
      ),
      recent: pagesRecent.map((row) => ({
        id: String(row._id),
        title: row.title || 'Untitled page',
        subtitle: '',
        status: row.visibility || 'hidden',
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : '',
      })),
    },
  };
}
