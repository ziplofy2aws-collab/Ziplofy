import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatBlogCommentsLabel, useBlogs } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

type BlogSort = 'asc' | 'desc';

function formatBlogUpdatedAt(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
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

export const ContentBlogsPage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { blogs, loading, fetchBlogsByStoreId } = useBlogs();
  const [titleSort, setTitleSort] = useState<BlogSort>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId]);

  const sortedBlogs = useMemo(() => {
    const list = blogs.map((blog) => ({
      id: blog._id,
      title: blog.title,
      comments: formatBlogCommentsLabel(blog.comments),
      updatedAt: blog.updatedAt,
    }));
    list.sort((a, b) => {
      const aKey = a.title.toLowerCase();
      const bKey = b.title.toLowerCase();
      if (aKey < bKey) return titleSort === 'asc' ? -1 : 1;
      if (aKey > bKey) return titleSort === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [blogs, titleSort]);

  const visibleIds = useMemo(() => sortedBlogs.map((blog) => blog.id), [sortedBlogs]);
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

  const handleSelectRow = (blogId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(blogId);
      else next.delete(blogId);
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

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            <Link
              to="/content/articles"
              className="inline-flex items-center gap-1 font-normal text-gray-500 transition-colors hover:text-gray-700"
            >
              <PencilSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Blog posts
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
            <span className="truncate font-normal text-gray-700">Manage blogs</span>
          </nav>

          <Link
            to="/content/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add blog
          </Link>
        </div>

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
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => handleSelectAllVisible(e.target.checked)}
                      aria-label="Select all blogs"
                      className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                    />
                  </th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setTitleSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                      className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 hover:text-gray-700"
                    >
                      Title
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-xs font-normal text-gray-500">Comments</th>
                  <th className="px-3 py-2 text-xs font-normal text-gray-500">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && sortedBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-[13px] font-normal text-gray-500">
                      Loading blogs…
                    </td>
                  </tr>
                ) : sortedBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-[13px] font-normal text-gray-500">
                      No blogs yet. Create your first blog to get started.
                    </td>
                  </tr>
                ) : (
                  sortedBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    onClick={() => navigate(`/content/blogs/${blog.id}`)}
                    className={`cursor-pointer transition-colors ${
                      selectedIds.has(blog.id) ? 'bg-gray-50' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td
                      className="w-10 px-3 py-2.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(blog.id)}
                        onChange={(e) => handleSelectRow(blog.id, e.target.checked)}
                        aria-label={`Select blog ${blog.title}`}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-[13px] font-medium text-gray-800">
                      <Link
                        to={`/content/blogs/${blog.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {blog.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">
                      {blog.comments}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[13px] font-normal text-gray-600">
                      {formatBlogUpdatedAt(blog.updatedAt)}
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
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Blogs
            </a>{' '}
            are a great way to build a community around your products and your brand.
          </p>
        </div>
      </div>
    </div>
  );
};
