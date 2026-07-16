import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DeleteBlogModal } from '../components/DeleteBlogModal';
import { BlogThemeTemplateSection } from '../components/blogs/BlogThemeTemplateSection';
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
  themeTemplate: string;
};

function BlogSettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-2.5">
        <h2 className="text-[13px] font-medium text-gray-800">{title}</h2>
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
    themeTemplate: blog.themeTemplate?.trim() || 'default',
  };
}

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
  const [themeTemplate, setThemeTemplate] = useState('default');
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
        setThemeTemplate(snapshot.themeTemplate);
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
      themeTemplate,
    }),
    [blogTitle, pageTitle, metaDescription, urlHandle, comments, themeTemplate]
  );

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return (
      currentSnapshot.title !== initial.title ||
      currentSnapshot.pageTitle !== initial.pageTitle ||
      currentSnapshot.metaDescription !== initial.metaDescription ||
      currentSnapshot.urlHandle !== initial.urlHandle ||
      currentSnapshot.comments !== initial.comments ||
      currentSnapshot.themeTemplate !== initial.themeTemplate
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
        themeTemplate,
      });
      const snapshot = snapshotFromBlog(blog);
      setInitial(snapshot);
      setBlogTitle(snapshot.title);
      setPageTitle(snapshot.pageTitle);
      setMetaDescription(snapshot.metaDescription);
      setUrlHandle(snapshot.urlHandle);
      setComments(snapshot.comments);
      setThemeTemplate(snapshot.themeTemplate);
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
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-gray-500">
        Blog not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav
            className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
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
            <span className="truncate font-medium text-gray-800">
              {blogTitle.trim() || initial?.title || 'Blog'}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            {viewHref ? (
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                View
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-400"
              >
                View
              </button>
            )}

            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                More actions
                <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
              {moreMenuOpen ? (
                <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] font-normal text-red-600 hover:bg-gray-50"
                  >
                    Delete blog
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {!loaded && loading ? (
          <p className="text-[13px] font-normal text-gray-500">Loading blog…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <div className="flex flex-col gap-3">
                <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
                  <div>
                    <label
                      htmlFor={titleInputId}
                      className="mb-1 block text-xs font-normal text-gray-500"
                    >
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
                  urlOrigin={storefrontBase || undefined}
                  metaDescriptionMax={SNIPPET_MAX}
                  onPageTitleChange={setPageTitle}
                  onMetaDescriptionChange={setMetaDescription}
                  onUrlHandleChange={setUrlHandle}
                  compact
                />
              </div>

              <div className="flex flex-col gap-3">
                <BlogSettingsCard title="Comments">
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'disabled'}
                        onChange={() => setComments('disabled')}
                        className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      Disabled
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'moderated'}
                        onChange={() => setComments('moderated')}
                        className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      Allowed, pending moderation
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                      <input
                        type="radio"
                        name="blog-comments-edit"
                        checked={comments === 'allowed'}
                        onChange={() => setComments('allowed')}
                        className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      Allowed
                    </label>
                  </div>
                </BlogSettingsCard>

                <BlogThemeTemplateSection
                  storeId={activeStoreId}
                  value={themeTemplate}
                  onChange={setThemeTemplate}
                />
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
