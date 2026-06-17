import {
  ArrowsUpDownIcon,
  Bars3Icon,
  ChevronRightIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useBlogComments,
  type BlogComment,
  type BlogCommentArticleRef,
  type BlogCommentStatus,
} from '../contexts/blog-comment.context';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogs, type Blog, type BlogCommentsMode } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

type StatusFilter = 'all' | BlogCommentStatus;
type SortOrder = 'asc' | 'desc';

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

function statusLabel(status: BlogCommentStatus): string {
  if (status === 'published') return 'Approved';
  if (status === 'pending') return 'Pending';
  return 'Spam';
}

function statusClass(status: BlogCommentStatus): string {
  if (status === 'published') return 'bg-emerald-50 text-emerald-700';
  if (status === 'pending') return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function commentsModeBanner(comments: BlogCommentsMode | undefined) {
  if (comments === 'disabled') {
    return 'Comments for this blog are disabled.';
  }
  if (comments === 'moderated') {
    return 'Comments for this blog are allowed with moderation.';
  }
  return 'Comments for this blog are allowed without moderation.';
}

function getArticleTitle(comment: BlogComment, fallback: string): string {
  const article = comment.articleId;
  if (article && typeof article === 'object' && 'title' in article) {
    return (article as BlogCommentArticleRef).title || fallback;
  }
  return fallback;
}

function FilterDropdown({
  label,
  valueLabel,
  active,
  children,
}: {
  label: string;
  valueLabel: string;
  active: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[12px] font-normal transition-colors ${
          active
            ? 'border-gray-300 bg-gray-100 text-gray-800'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {valueLabel || label}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
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
      className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] ${
        selected ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  published: 'Approved',
  pending: 'Pending',
  spam: 'Spam',
};

export const BlogPostCommentsPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { activeStoreId } = useStore();
  const { fetchBlogPostById } = useBlogPosts();
  const { fetchBlogById } = useBlogs();
  const { comments, loading, fetchCommentsByStoreId, updateComment, deleteComment } =
    useBlogComments();

  const [postTitle, setPostTitle] = useState('');
  const [parentBlog, setParentBlog] = useState<Blog | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async () => {
    if (!articleId || !activeStoreId) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    try {
      const post = await fetchBlogPostById(articleId, activeStoreId);
      setPostTitle(post.title);
      const blog = await fetchBlogById(post.blogId, activeStoreId);
      setParentBlog(blog);
      await fetchCommentsByStoreId(activeStoreId, { articleId });
    } catch {
      toast.error('Failed to load blog post comments');
    } finally {
      setPageLoading(false);
    }
  }, [articleId, activeStoreId, fetchBlogPostById, fetchBlogById, fetchCommentsByStoreId]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!sortOpen && !filterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (sortOpen && !sortRef.current?.contains(event.target as Node)) setSortOpen(false);
      if (filterOpen && !filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen, filterOpen]);

  const filteredComments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = [...comments];

    if (statusFilter !== 'all') {
      rows = rows.filter((comment) => comment.status === statusFilter);
    }

    if (query) {
      rows = rows.filter((comment) => {
        const haystack = `${comment.message} ${comment.name} ${comment.email}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    rows.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return rows;
  }, [comments, searchQuery, statusFilter, sortOrder]);

  const allVisibleSelected =
    filteredComments.length > 0 && filteredComments.every((comment) => selectedIds.has(comment._id));

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredComments.map((comment) => comment._id)));
  };

  const handleSelectRow = (commentId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(commentId);
      else next.delete(commentId);
      return next;
    });
  };

  const handlePublish = async (comment: BlogComment) => {
    if (!activeStoreId) return;
    try {
      await updateComment(comment._id, { storeId: activeStoreId, status: 'published' });
      toast.success('Comment approved');
    } catch {
      toast.error('Failed to approve comment');
    }
  };

  const handleMarkSpam = async (comment: BlogComment) => {
    if (!activeStoreId) return;
    try {
      await updateComment(comment._id, { storeId: activeStoreId, status: 'spam' });
      toast.success('Comment marked as spam');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (comment: BlogComment) => {
    if (!activeStoreId) return;
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id, activeStoreId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(comment._id);
        return next;
      });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleBulkApprove = async () => {
    if (!activeStoreId || selectedIds.size === 0) return;
    try {
      await Promise.all(
        [...selectedIds].map((id) =>
          updateComment(id, { storeId: activeStoreId, status: 'published' })
        )
      );
      toast.success('Selected comments approved');
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to approve comments');
    }
  };

  const handleBulkDelete = async () => {
    if (!activeStoreId || selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} comment(s)?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => deleteComment(id, activeStoreId)));
      toast.success('Selected comments deleted');
      setSelectedIds(new Set());
    } catch {
      toast.error('Failed to delete comments');
    }
  };

  if (!articleId) {
    return (
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-gray-500">
        Blog post not found.
      </div>
    );
  }

  const blogTitle = parentBlog?.title ?? 'blog';
  const blogEditHref = parentBlog ? `/content/blogs/${parentBlog._id}` : '#';
  const bannerText = commentsModeBanner(parentBlog?.comments);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <nav
          className="mb-3 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
          aria-label="Breadcrumb"
        >
          <Link
            to="/content/articles"
            className="inline-flex items-center text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Blog posts"
          >
            <PencilSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <Link
            to={`/content/articles/${articleId}`}
            className="truncate font-normal text-gray-500 transition-colors hover:text-gray-700"
          >
            {postTitle.trim() || 'Blog post'}
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="truncate font-normal text-gray-700">Manage blog post comments</span>
        </nav>

        <div className="mb-4">
          <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">
            Manage blog post comments
          </h1>
          <p className="mt-0.5 text-[13px] font-normal text-gray-500">{blogTitle}</p>
        </div>

        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
          <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <p className="text-[13px] font-normal leading-relaxed text-gray-700">
            {bannerText} To change how comments are handled, edit the{' '}
            {parentBlog ? (
              <Link to={blogEditHref} className="font-medium text-indigo-600 hover:text-indigo-700">
                {blogTitle}
              </Link>
            ) : (
              <span className="font-medium text-indigo-600">{blogTitle}</span>
            )}{' '}
            blog.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-3 py-2">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search comments"
                    autoFocus
                    className="w-full rounded-md border border-blue-500 py-1.5 pl-8 pr-3 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="shrink-0 text-[13px] font-normal text-gray-800 transition-colors hover:text-gray-600"
                >
                  Cancel
                </button>
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    title="Sort"
                    onClick={() => setSortOpen((open) => !open)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-gray-500 transition-colors hover:bg-gray-50 ${
                      sortOpen ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                    }`}
                  >
                    <ArrowsUpDownIcon className="h-3.5 w-3.5" />
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
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <FilterDropdown
                    label="Status"
                    valueLabel={STATUS_FILTER_LABELS[statusFilter]}
                    active={statusFilter !== 'all'}
                  >
                    {(close) => (
                      <>
                        {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((value) => (
                          <FilterOption
                            key={value}
                            selected={statusFilter === value}
                            onClick={() => {
                              setStatusFilter(value);
                              close();
                            }}
                          >
                            {STATUS_FILTER_LABELS[value]}
                          </FilterOption>
                        ))}
                      </>
                    )}
                  </FilterDropdown>

                  {selectedIds.size > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleBulkApprove()}
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[12px] text-gray-700 hover:bg-gray-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleBulkDelete()}
                        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[12px] text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Search"
                    onClick={() => setSearchOpen(true)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative" ref={filterRef}>
                    <button
                      type="button"
                      title="Filter"
                      onClick={() => setFilterOpen((open) => !open)}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-gray-500 transition-colors hover:bg-gray-50 ${
                        filterOpen || statusFilter !== 'all' ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      <Bars3Icon className="h-3.5 w-3.5" />
                    </button>
                    {filterOpen ? (
                      <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((value) => (
                          <FilterOption
                            key={value}
                            selected={statusFilter === value}
                            onClick={() => {
                              setStatusFilter(value);
                              setFilterOpen(false);
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
                      title="Sort"
                      onClick={() => setSortOpen((open) => !open)}
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border bg-white text-gray-500 transition-colors hover:bg-gray-50 ${
                        sortOpen ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" />
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
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[12px] font-medium text-gray-500">
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all comments"
                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </th>
                  <th className="px-3 py-2 font-medium">Comment</th>
                  <th className="px-3 py-2 font-medium">Comment by</th>
                  <th className="px-3 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() => setSortOrder((order) => (order === 'desc' ? 'asc' : 'desc'))}
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700"
                    >
                      Date
                      <ArrowsUpDownIcon className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-3 py-2 font-medium">Blog post</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageLoading || loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-[13px] text-gray-500">
                      Loading comments…
                    </td>
                  </tr>
                ) : filteredComments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-[13px] text-gray-500">
                      No comments found
                    </td>
                  </tr>
                ) : (
                  filteredComments.map((comment) => (
                    <tr
                      key={comment._id}
                      className={`group transition-colors ${
                        selectedIds.has(comment._id) ? 'bg-gray-50' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="w-10 px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(comment._id)}
                          onChange={(e) => handleSelectRow(comment._id, e.target.checked)}
                          aria-label={`Select comment by ${comment.name}`}
                          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                        />
                      </td>
                      <td className="max-w-[220px] px-3 py-2.5">
                        <p className="truncate text-[13px] font-normal text-gray-800">
                          {comment.message}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[13px] font-normal text-gray-800">{comment.name}</p>
                        <p className="text-[12px] font-normal text-gray-500">{comment.email}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-gray-600">
                        {formatRelativeDate(comment.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">
                        {getArticleTitle(comment, postTitle.trim() || 'Blog post')}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${statusClass(comment.status)}`}
                          >
                            {statusLabel(comment.status)}
                          </span>
                          <div className="hidden items-center gap-1 group-hover:flex">
                            {comment.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => void handlePublish(comment)}
                                className="rounded px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
                              >
                                Approve
                              </button>
                            ) : null}
                            {comment.status !== 'spam' ? (
                              <button
                                type="button"
                                onClick={() => void handleMarkSpam(comment)}
                                className="rounded px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
                              >
                                Spam
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleDelete(comment)}
                              className="rounded px-1.5 py-0.5 text-[11px] text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            Learn more about managing{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              comments
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
