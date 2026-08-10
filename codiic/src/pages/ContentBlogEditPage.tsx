import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../components/admin-list-ui';
import { DeleteBlogModal } from '../components/DeleteBlogModal';
import { useBlogs, type Blog, type BlogCommentsMode } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';
import {
  buildStorefrontBlogUrl,
  normalizeStorefrontOrigin,
  resolveBlogUrlHandle,
} from '../utils/storefront-url.util';

const BLOG_TITLE_MAX = 255;

type BlogComments = BlogCommentsMode;

type BlogFormSnapshot = {
  title: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  comments: BlogComments;
};

function BlogSettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function snapshotFromBlog(blog: Blog): BlogFormSnapshot {
  return {
    title: blog.title,
    pageTitle: blog.pageTitle,
    metaDescription: blog.metaDescription,
    urlHandle: blog.urlHandle,
    comments: blog.comments,
  };
}

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-3 pr-14 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

export const ContentBlogEditPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { storeSubdomain, getByStoreId } = useStoreSubdomain();
  const { fetchBlogById, updateBlog, deleteBlog, loading } = useBlogs();
  const titleInputId = useId();
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const [blogTitle, setBlogTitle] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [comments, setComments] = useState<BlogComments>('disabled');
  const [initial, setInitial] = useState<BlogFormSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!activeStoreId) return;
    void getByStoreId(activeStoreId);
  }, [activeStoreId, getByStoreId]);

  useEffect(() => {
    if (!blogId || !activeStoreId) return;

    let cancelled = false;
    setLoaded(false);

    void fetchBlogById(blogId, activeStoreId)
      .then((blog) => {
        if (cancelled) return;
        const snapshot = snapshotFromBlog(blog);
        setBlogTitle(snapshot.title);
        setPageTitle(snapshot.pageTitle);
        setMetaDescription(snapshot.metaDescription);
        setUrlHandle(snapshot.urlHandle);
        setComments(snapshot.comments);
        setInitial(snapshot);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load blog');
      });

    return () => {
      cancelled = true;
    };
  }, [blogId, activeStoreId, fetchBlogById]);

  useEffect(() => {
    if (!moreMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreMenuOpen]);

  const currentSnapshot = useMemo<BlogFormSnapshot>(
    () => ({
      title: blogTitle,
      pageTitle,
      metaDescription,
      urlHandle,
      comments,
    }),
    [blogTitle, pageTitle, metaDescription, urlHandle, comments]
  );

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return (
      currentSnapshot.title !== initial.title ||
      currentSnapshot.pageTitle !== initial.pageTitle ||
      currentSnapshot.metaDescription !== initial.metaDescription ||
      currentSnapshot.urlHandle !== initial.urlHandle ||
      currentSnapshot.comments !== initial.comments
    );
  }, [currentSnapshot, initial]);

  const canSave =
    blogTitle.trim().length > 0 && isDirty && !saving && !loading && loaded;

  const storefrontBase = normalizeStorefrontOrigin(storeSubdomain?.url);
  const blogHandle = resolveBlogUrlHandle(urlHandle, initial?.urlHandle, blogTitle);
  const viewHref = buildStorefrontBlogUrl(storefrontBase, blogHandle);

  const handleSave = async () => {
    if (!blogTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!activeStoreId || !blogId) {
      toast.error('Select a store before saving a blog');
      return;
    }

    try {
      setSaving(true);
      const blog = await updateBlog(blogId, {
        storeId: activeStoreId,
        title: blogTitle.trim(),
        pageTitle: pageTitle.trim() || undefined,
        metaDescription: metaDescription.trim(),
        urlHandle: urlHandle.trim() || undefined,
        comments,
      });
      const snapshot = snapshotFromBlog(blog);
      setInitial(snapshot);
      setBlogTitle(snapshot.title);
      setPageTitle(snapshot.pageTitle);
      setMetaDescription(snapshot.metaDescription);
      setUrlHandle(snapshot.urlHandle);
      setComments(snapshot.comments);
      toast.success('Blog saved');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save blog';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!blogId || !activeStoreId) return;

    try {
      setDeleting(true);
      await deleteBlog(blogId, activeStoreId);
      toast.success('Blog deleted');
      setDeleteModalOpen(false);
      navigate('/content/blogs');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete blog';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (!blogId) {
    return (
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-admin-text-secondary">
        Blog not found.
      </div>
    );
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav
            className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
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
            <span className="truncate font-medium text-admin-text">
              {blogTitle.trim() || initial?.title || 'Blog'}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            {viewHref ? (
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className={adminListSecondaryButtonClass}
              >
                View
              </a>
            ) : (
              <button type="button" disabled className={adminListSecondaryButtonClass}>
                View
              </button>
            )}

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className={adminListSecondaryButtonClass}
              >
                More actions
                <ChevronDownIcon className="ml-1 h-3.5 w-3.5" aria-hidden />
              </button>
              {moreMenuOpen ? (
                <div className="absolute right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-admin-border bg-admin-surface py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-admin-row-hover"
                  >
                    Delete blog
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {!loaded && loading ? (
          <p className="text-[13px] text-admin-text-secondary">Loading blog…</p>
        ) : (
          <>
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
                  urlOrigin={storefrontBase || undefined}
                  metaDescriptionMax={SNIPPET_MAX}
                  onPageTitleChange={setPageTitle}
                  onMetaDescriptionChange={setMetaDescription}
                  onUrlHandleChange={setUrlHandle}
                  compact
                />
              </div>

              <div className="flex flex-col gap-4">
                <BlogSettingsCard title="Comments">
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'disabled'}
                        onChange={() => setComments('disabled')}
                        className={radioClass}
                      />
                      Disabled
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'moderated'}
                        onChange={() => setComments('moderated')}
                        className={radioClass}
                      />
                      Allowed, pending moderation
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'allowed'}
                        onChange={() => setComments('allowed')}
                        className={radioClass}
                      />
                      Allowed
                    </label>
                  </div>
                </BlogSettingsCard>
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
          </>
        )}
      </div>

      <DeleteBlogModal
        isOpen={deleteModalOpen}
        blogTitle={blogTitle.trim() || initial?.title}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteModalOpen(false);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
};
