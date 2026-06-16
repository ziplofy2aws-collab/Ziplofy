import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogs } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

type UpdatedSort = 'asc' | 'desc';

function formatRelativeUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isSameDay) {
      return `Today at ${time.toLowerCase()}`;
    }

    const dayName = date.toLocaleString(undefined, { weekday: 'long' });
    return `${dayName} at ${time.toLowerCase()}`;
  } catch {
    return iso;
  }
}

function formatPublishedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function VisibilityBadge({ visibility }: { visibility: 'visible' | 'hidden' }) {
  if (visibility === 'visible') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700">
        Visible
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[12px] font-medium text-sky-700">
      Hidden
    </span>
  );
}

function BlogPostsEmptyIllustration() {
  return (
    <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gray-100" />

      <div className="absolute -top-1 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm">
        <span className="text-[10px] font-medium text-gray-600">B</span>
        <span className="text-[10px] font-normal text-gray-400">I</span>
        <span className="text-[10px] font-normal text-gray-400 underline">U</span>
      </div>

      <div className="relative z-1 mt-2 h-[88px] w-[72px] rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="absolute -left-1 top-2 flex h-[72px] w-2 flex-col justify-between py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          ))}
        </div>
        <div className="p-2.5 pl-3">
          <div className="mb-1.5 h-7 w-full rounded-sm bg-gray-100" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded bg-gray-100" />
            <div className="h-1 w-[85%] rounded bg-gray-100" />
            <div className="h-1 w-[70%] rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogPostsTable({
  posts,
  loading,
  selectedIds,
  selectAllRef,
  allVisibleSelected,
  updatedSort,
  onUpdatedSortToggle,
  onSelectAllVisible,
  onSelectRow,
  onPostClick,
}: {
  posts: Array<{
    id: string;
    title: string;
    visibility: 'visible' | 'hidden';
    author: string;
    blogTitle: string;
    featuredImageUrl: string;
    updatedAt: string;
    createdAt: string;
  }>;
  loading: boolean;
  selectedIds: Set<string>;
  selectAllRef: React.RefObject<HTMLInputElement | null>;
  allVisibleSelected: boolean;
  updatedSort: UpdatedSort;
  onUpdatedSortToggle: () => void;
  onSelectAllVisible: (checked: boolean) => void;
  onSelectRow: (postId: string, checked: boolean) => void;
  onPostClick: (postId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[13px] font-normal text-gray-700"
          >
            All
          </button>
          <button
            type="button"
            title="Create view"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Search and filter"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-gray-500 transition-colors hover:bg-gray-50"
          >
            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
            <Bars3BottomLeftIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Sort"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
          >
            <ArrowsUpDownIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-10 px-3 py-2 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => onSelectAllVisible(e.target.checked)}
                  aria-label="Select all blog posts"
                  className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                />
              </th>
              <th className="px-3 py-2 text-xs font-normal text-gray-500">Title</th>
              <th className="px-3 py-2 text-xs font-normal text-gray-500">Visibility</th>
              <th className="px-3 py-2 text-xs font-normal text-gray-500">Author</th>
              <th className="px-3 py-2 text-xs font-normal text-gray-500">Blog</th>
              <th className="px-3 py-2">
                <button
                  type="button"
                  onClick={onUpdatedSortToggle}
                  className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 hover:text-gray-700"
                >
                  Updated
                  <ChevronDownIcon
                    className={`h-3.5 w-3.5 transition-transform ${
                      updatedSort === 'asc' ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
              </th>
              <th className="px-3 py-2 text-xs font-normal text-gray-500">Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && posts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-[13px] font-normal text-gray-500"
                >
                  Loading blog posts…
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => onPostClick(post.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedIds.has(post.id) ? 'bg-gray-50' : 'hover:bg-gray-50/80'
                  }`}
                >
                  <td
                    className="w-10 px-3 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(post.id)}
                      onChange={(e) => onSelectRow(post.id, e.target.checked)}
                      aria-label={`Select blog post ${post.title}`}
                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        {post.featuredImageUrl ? (
                          <img
                            src={post.featuredImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PhotoIcon className="h-4 w-4 text-gray-400" aria-hidden />
                        )}
                      </div>
                      <span className="truncate text-[13px] font-semibold text-gray-800 hover:text-blue-600">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <VisibilityBadge visibility={post.visibility} />
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">
                    {post.author}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">
                    {post.blogTitle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-gray-600">
                    {formatRelativeUpdatedAt(post.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-gray-600">
                    {post.visibility === 'visible' ? formatPublishedAt(post.createdAt) : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ContentBlogPostsPage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
  const { blogPosts, loading, fetchBlogPostsByStoreId } = useBlogPosts();
  const [updatedSort, setUpdatedSort] = useState<UpdatedSort>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogPostsByStoreId(activeStoreId);
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogPostsByStoreId, fetchBlogsByStoreId]);

  const blogTitleById = useMemo(() => {
    return new Map(blogs.map((blog) => [blog._id, blog.title]));
  }, [blogs]);

  const sortedPosts = useMemo(() => {
    const list = blogPosts.map((post) => ({
      id: post._id,
      title: post.title,
      visibility: post.visibility,
      author: post.author || '—',
      blogTitle: blogTitleById.get(post.blogId) ?? '—',
      featuredImageUrl: post.featuredImageUrl,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
    }));

    list.sort((a, b) => {
      const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return updatedSort === 'desc' ? -diff : diff;
    });

    return list;
  }, [blogPosts, blogTitleById, updatedSort]);

  const visibleIds = useMemo(() => sortedPosts.map((post) => post.id), [sortedPosts]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.has(id)).length,
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  const handleSelectRow = (postId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(postId);
      else next.delete(postId);
      return next;
    });
  };

  const handleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        visibleIds.forEach((id) => next.add(id));
      } else {
        visibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const showEmptyState = !loading && sortedPosts.length === 0;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
            <h1 className="text-lg font-medium text-gray-900">Blog posts</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/content/blogs"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Manage blogs
            </Link>
            {!showEmptyState ? (
              <button
                type="button"
                onClick={() => navigate('/content/articles/new')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Create blog post
              </button>
            ) : null}
          </div>
        </div>

        {showEmptyState ? (
          <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
              <BlogPostsEmptyIllustration />

              <h2 className="text-[15px] font-medium text-gray-800">Write a blog post</h2>
              <p className="mt-1.5 max-w-md text-[13px] font-normal leading-relaxed text-gray-500">
                Blog posts are a great way to build a community around your products and your brand.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Learn more
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/content/articles/new')}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Create blog post
                </button>
              </div>
            </div>
          </div>
        ) : (
          <BlogPostsTable
            posts={sortedPosts}
            loading={loading}
            selectedIds={selectedIds}
            selectAllRef={selectAllRef}
            allVisibleSelected={allVisibleSelected}
            updatedSort={updatedSort}
            onUpdatedSortToggle={() => setUpdatedSort((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            onSelectAllVisible={handleSelectAllVisible}
            onSelectRow={handleSelectRow}
            onPostClick={(postId) => navigate(`/content/articles/${postId}`)}
          />
        )}

        {!showEmptyState ? (
          <div className="py-5 text-center">
            <p className="text-xs text-gray-500">
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Learn more about blog posts
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
