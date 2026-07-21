import { ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useBlogs, type BlogCommentsMode } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';

const BLOG_TITLE_MAX = 255;

type BlogComments = BlogCommentsMode;

function BlogCreateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-2.5">
        <h2 className="text-[13px] font-medium text-gray-800">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export const ContentBlogCreatePage = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createBlog, loading } = useBlogs();
  const titleInputId = useId();
  const [blogTitle, setBlogTitle] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [comments, setComments] = useState<BlogComments>('disabled');
  const [saving, setSaving] = useState(false);

  const canSave = blogTitle.trim().length > 0 && !saving && !loading;

  const handleSave = async () => {
    if (!blogTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving a blog');
      return;
    }

    try {
      setSaving(true);
      await createBlog({
        storeId: activeStoreId,
        title: blogTitle.trim(),
        pageTitle: pageTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        urlHandle: urlHandle.trim() || undefined,
        comments,
      });
      toast.success('Blog saved');
      navigate('/content/blogs');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save blog';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

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
            to="/content/blogs"
            className="font-normal text-gray-500 transition-colors hover:text-gray-700"
          >
            Manage blogs
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="truncate font-normal text-gray-700">Add blog</span>
        </nav>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-3">
            <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
              <div>
                <label htmlFor={titleInputId} className="mb-1 block text-xs font-normal text-gray-500">
                  Title
                </label>
                <div className="relative">
                  <input
                    id={titleInputId}
                    type="text"
                    value={blogTitle}
                    maxLength={BLOG_TITLE_MAX}
                    onChange={(e) => setBlogTitle(e.target.value.slice(0, BLOG_TITLE_MAX))}
                    className="w-full rounded-md border border-gray-200 py-1.5 pl-3 pr-14 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-normal text-gray-400">
                    {blogTitle.length}/{BLOG_TITLE_MAX}
                  </span>
                </div>
              </div>
            </section>

            <SearchEngineListingEditor
              entityTitle={blogTitle}
              pageTitle={pageTitle}
              metaDescription={metaDescription}
              urlHandle={urlHandle}
              urlPrefix="blogs"
              fallbackSlug="blog"
              metaDescriptionMax={SNIPPET_MAX}
              onPageTitleChange={setPageTitle}
              onMetaDescriptionChange={setMetaDescription}
              onUrlHandleChange={setUrlHandle}
              compact
            />
          </div>

          <div className="flex flex-col gap-3">
            <BlogCreateCard title="Comments">
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'disabled'}
                    onChange={() => setComments('disabled')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Disabled
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'moderated'}
                    onChange={() => setComments('moderated')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Allowed, pending moderation
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'allowed'}
                    onChange={() => setComments('allowed')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Allowed
                </label>
              </div>
            </BlogCreateCard>

          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="inline-flex min-w-22 items-center justify-center rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 enabled:bg-blue-600 enabled:text-white enabled:hover:bg-blue-700"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
