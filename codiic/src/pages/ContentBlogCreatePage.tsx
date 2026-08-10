import { ChevronRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
} from '../components/admin-list-ui';
import { useBlogs, type BlogCommentsMode } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';

const BLOG_TITLE_MAX = 255;

type BlogComments = BlogCommentsMode;

function BlogCreateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-3 pr-14 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

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
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <nav
          className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
          aria-label="Breadcrumb"
        >
          <Link
            to="/content/articles"
            className={`inline-flex items-center ${adminListFooterLinkClass}`}
            aria-label="Blog posts"
          >
            <PencilSquareIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
          <Link to="/content/blogs" className={`font-medium ${adminListFooterLinkClass}`}>
            Manage blogs
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
          <span className="truncate font-medium text-admin-text">Add blog</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-admin-border bg-admin-surface p-4 sm:p-5">
              <div>
                <label htmlFor={titleInputId} className={fieldLabelClass}>
                  Title
                </label>
                <div className="relative">
                  <input
                    id={titleInputId}
                    type="text"
                    value={blogTitle}
                    maxLength={BLOG_TITLE_MAX}
                    onChange={(e) => setBlogTitle(e.target.value.slice(0, BLOG_TITLE_MAX))}
                    className={fieldInputClass}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-admin-text-subdued">
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

          <div className="flex flex-col gap-4">
            <BlogCreateCard title="Comments">
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'disabled'}
                    onChange={() => setComments('disabled')}
                    className={radioClass}
                  />
                  Disabled
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'moderated'}
                    onChange={() => setComments('moderated')}
                    className={radioClass}
                  />
                  Allowed, pending moderation
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="blog-comments"
                    checked={comments === 'allowed'}
                    onChange={() => setComments('allowed')}
                    className={radioClass}
                  />
                  Allowed
                </label>
              </div>
            </BlogCreateCard>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className={adminListPrimaryButtonClass}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
