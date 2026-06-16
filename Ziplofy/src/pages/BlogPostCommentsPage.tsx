import {
  ChevronRightIcon,
  InformationCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogs, type Blog } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';

function CommentsEmptyIllustration() {
  return (
    <div className="relative mx-auto mb-6 flex h-36 w-44 items-center justify-center">
      <div className="absolute bottom-2 left-2 h-16 w-20 rounded-2xl rounded-bl-sm bg-gray-200/90 shadow-sm">
        <div className="space-y-1.5 px-3 py-3">
          <div className="h-1.5 w-10 rounded bg-white/80" />
          <div className="h-1.5 w-7 rounded bg-white/70" />
        </div>
      </div>

      <div className="absolute right-3 top-2 z-10 h-[72px] w-[88px] rounded-2xl rounded-tr-sm bg-teal-500 shadow-md">
        <div className="flex items-start justify-between px-3 pt-3">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" aria-hidden>
            <path
              fill="currentColor"
              d="M10 17.5c-.5 0-1-.15-1.45-.4-2.35-1.25-5.55-4.05-7.7-7.35C.35 8.05.35 5.2 2.1 3.45 3.85 1.7 6.7 1.7 8.95 3.45c.35.3.65.65.95 1.05.3-.4.6-.75.95-1.05 2.25-1.75 5.1-1.75 6.85 0 1.75 1.75 1.75 4.6-.75 6.75-2.15 3.3-5.35 6.1-7.7 7.35-.45.25-.95.4-1.45.4z"
            />
          </svg>
        </div>
        <div className="space-y-1.5 px-3 pb-3">
          <div className="h-1.5 w-12 rounded bg-white/85" />
          <div className="h-1.5 w-9 rounded bg-white/75" />
        </div>
      </div>

      <div className="absolute bottom-6 right-10 z-0 h-14 w-16 rounded-2xl bg-gray-300/80 shadow-sm" />
    </div>
  );
}

export const BlogPostCommentsPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { activeStoreId } = useStore();
  const { fetchBlogPostById } = useBlogPosts();
  const { fetchBlogById } = useBlogs();

  const [postTitle, setPostTitle] = useState('');
  const [parentBlog, setParentBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId || !activeStoreId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchBlogPostById(articleId, activeStoreId)
      .then(async (post) => {
        if (cancelled) return;
        setPostTitle(post.title);
        const blog = await fetchBlogById(post.blogId, activeStoreId);
        if (!cancelled) setParentBlog(blog);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load blog post comments');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, activeStoreId, fetchBlogPostById, fetchBlogById]);

  if (!articleId) {
    return (
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-gray-500">
        Blog post not found.
      </div>
    );
  }

  const commentsDisabled = parentBlog?.comments === 'disabled';
  const blogTitle = parentBlog?.title ?? 'blog';

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <nav
          className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
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

        {commentsDisabled ? (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            <p className="text-[13px] font-normal leading-relaxed text-gray-700">
              Comments for this blog are disabled. To change how comments are handled, edit the{' '}
              {parentBlog ? (
                <Link
                  to={`/content/blogs/${parentBlog._id}`}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {blogTitle}
                </Link>
              ) : (
                <span className="font-medium text-indigo-600">{blogTitle}</span>
              )}{' '}
              blog.
            </p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center px-6 py-14 text-center">
              <p className="text-[13px] font-normal text-gray-500">Loading comments…</p>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-14 text-center">
              <CommentsEmptyIllustration />

              <h2 className="text-[15px] font-medium text-gray-800">Manage comments</h2>
              <p className="mt-1.5 max-w-md text-[13px] font-normal leading-relaxed text-gray-500">
                Comments will appear once posted on your blog posts.
              </p>
            </div>
          )}
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
