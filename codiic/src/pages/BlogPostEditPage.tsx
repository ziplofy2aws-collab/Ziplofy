import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../components/admin-list-ui';
import { DeleteBlogPostModal } from '../components/DeleteBlogPostModal';
import ArticleAddedBanner from '../components/blog-posts/ArticleAddedBanner';
import BlogPostFormPageSkeleton from '../components/blog-posts/BlogPostFormPageSkeleton';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import {
  SelectImageModal,
  type SelectedImageAsset,
} from '../components/SelectImageModal';
import BlogTagsInput from '../components/tags/BlogTagsInput';
import { useBlogPosts, type BlogPost, type BlogPostVisibility } from '../contexts/blog-post.context';
import { useBlogs, type Blog } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';
import {
  buildStorefrontBlogPostUrl,
  normalizeStorefrontOrigin,
  resolveBlogPostUrlHandle,
} from '../utils/storefront-url.util';
import { readArticleJustCreated } from '../utils/blog-post-navigation.util';

type Visibility = BlogPostVisibility;

type BlogPostFormSnapshot = {
  title: string;
  content: string;
  excerpt: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: Visibility;
  author: string;
  blogId: string;
  tagIds: string[];
  featuredImageUrl: string;
  featuredImageKey: string;
  featuredImageUploadId: string;
};

function BlogPostCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="flex items-center justify-between gap-3 border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  if (visibility === 'visible') {
    return (
      <span className="inline-flex items-center rounded-full bg-[#cdfee1] px-2 py-0.5 text-[12px] font-medium text-[#0c5132]">
        Visible
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-admin-secondary px-2 py-0.5 text-[12px] font-medium text-admin-text-secondary">
      Hidden
    </span>
  );
}

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-3 pr-9 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const fieldInputPlainClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass = 'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';
const iconButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-text-secondary transition-colors hover:bg-admin-row-hover disabled:cursor-not-allowed disabled:opacity-40';

function snapshotFromPost(post: BlogPost): BlogPostFormSnapshot {
  return {
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    pageTitle: post.pageTitle,
    metaDescription: post.metaDescription,
    urlHandle: post.urlHandle,
    visibility: post.visibility,
    author: post.author,
    blogId: post.blogId,
    tagIds: [...post.tagIds],
    featuredImageUrl: post.featuredImageUrl,
    featuredImageKey: post.featuredImageKey,
    featuredImageUploadId: post.featuredImageUploadId,
  };
}

function snapshotsEqual(a: BlogPostFormSnapshot, b: BlogPostFormSnapshot): boolean {
  return (
    a.title === b.title &&
    a.content === b.content &&
    a.excerpt === b.excerpt &&
    a.pageTitle === b.pageTitle &&
    a.metaDescription === b.metaDescription &&
    a.urlHandle === b.urlHandle &&
    a.visibility === b.visibility &&
    a.author === b.author &&
    a.blogId === b.blogId &&
    a.featuredImageUrl === b.featuredImageUrl &&
    a.featuredImageKey === b.featuredImageKey &&
    a.featuredImageUploadId === b.featuredImageUploadId &&
    a.tagIds.length === b.tagIds.length &&
    a.tagIds.every((id, index) => id === b.tagIds[index])
  );
}

export const BlogPostEditPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const articleJustCreatedOnMount = useRef(readArticleJustCreated(location.state));
  const previousArticleIdRef = useRef(articleId);
  const [showArticleAddedBanner, setShowArticleAddedBanner] = useState(
    () => articleJustCreatedOnMount.current
  );
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId, fetchBlogById } = useBlogs();
  const {
    blogPosts,
    fetchBlogPostById,
    fetchBlogPostsByStoreId,
    updateBlogPost,
    deleteBlogPost,
    loading,
  } = useBlogPosts();
  const { storeSubdomain, getByStoreId } = useStoreSubdomain();
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptEditing, setExcerptEditing] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('hidden');
  const [author, setAuthor] = useState('');
  const [blogId, setBlogId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageKey, setFeaturedImageKey] = useState('');
  const [featuredImageUploadId, setFeaturedImageUploadId] = useState('');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [initial, setInitial] = useState<BlogPostFormSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkedBlog, setLinkedBlog] = useState<Blog | null>(null);

  const excerptEmpty = useMemo(() => !excerpt.replace(/<[^>]+>/g, '').trim(), [excerpt]);

  const selectedBlog = useMemo(
    () => blogs.find((row) => row._id === blogId) ?? linkedBlog,
    [blogs, blogId, linkedBlog]
  );

  const currentSnapshot = useMemo<BlogPostFormSnapshot>(
    () => ({
      title,
      content,
      excerpt,
      pageTitle,
      metaDescription,
      urlHandle,
      visibility,
      author,
      blogId,
      tagIds: selectedTagIds,
      featuredImageUrl,
      featuredImageKey,
      featuredImageUploadId,
    }),
    [
      title,
      content,
      excerpt,
      pageTitle,
      metaDescription,
      urlHandle,
      visibility,
      author,
      blogId,
      selectedTagIds,
      featuredImageUrl,
      featuredImageKey,
      featuredImageUploadId,
    ]
  );

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return !snapshotsEqual(currentSnapshot, initial);
  }, [currentSnapshot, initial]);

  const canSave = title.trim().length > 0 && !!blogId && isDirty && !saving && !loading && loaded;

  const sortedPostIds = useMemo(() => {
    return [...blogPosts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((post) => post._id);
  }, [blogPosts]);

  const currentPostIndex = articleId ? sortedPostIds.indexOf(articleId) : -1;
  const previousPostId = currentPostIndex > 0 ? sortedPostIds[currentPostIndex - 1] : null;
  const nextPostId =
    currentPostIndex >= 0 && currentPostIndex < sortedPostIds.length - 1
      ? sortedPostIds[currentPostIndex + 1]
      : null;

  const storefrontBase = normalizeStorefrontOrigin(storeSubdomain?.url);
  const blogHandle = selectedBlog?.urlHandle ?? '';
  const postHandle = resolveBlogPostUrlHandle(urlHandle, initial?.urlHandle, title);
  const viewHref = buildStorefrontBlogPostUrl(storefrontBase, blogHandle, postHandle, {
    preview: true,
  });

  useEffect(() => {
    if (articleJustCreatedOnMount.current) {
      articleJustCreatedOnMount.current = false;
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (previousArticleIdRef.current !== articleId) {
      previousArticleIdRef.current = articleId;
      setShowArticleAddedBanner(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (!activeStoreId) return;
    void getByStoreId(activeStoreId);
    void fetchBlogsByStoreId(activeStoreId);
    void fetchBlogPostsByStoreId(activeStoreId);
  }, [activeStoreId, getByStoreId, fetchBlogsByStoreId, fetchBlogPostsByStoreId]);

  useEffect(() => {
    if (!articleId || !activeStoreId) return;

    let cancelled = false;
    setLoaded(false);
    setInitial(null);

    void fetchBlogPostById(articleId, activeStoreId)
      .then(async (post) => {
        if (cancelled) return;
        const snapshot = snapshotFromPost(post);
        setTitle(snapshot.title);
        setContent(snapshot.content);
        setExcerpt(snapshot.excerpt);
        setPageTitle(snapshot.pageTitle);
        setMetaDescription(snapshot.metaDescription);
        setUrlHandle(snapshot.urlHandle);
        setVisibility(snapshot.visibility);
        setAuthor(snapshot.author);
        setBlogId(snapshot.blogId);
        setSelectedTagIds(snapshot.tagIds);
        setFeaturedImageUrl(snapshot.featuredImageUrl);
        setFeaturedImageKey(snapshot.featuredImageKey);
        setFeaturedImageUploadId(snapshot.featuredImageUploadId);
        setInitial(snapshot);
        setLoaded(true);

        try {
          const blog = await fetchBlogById(post.blogId, activeStoreId);
          if (!cancelled) setLinkedBlog(blog);
        } catch {
          if (!cancelled) setLinkedBlog(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to load blog post');
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, activeStoreId, fetchBlogPostById, fetchBlogById]);

  useEffect(() => {
    if (!blogId || !activeStoreId) {
      setLinkedBlog(null);
      return;
    }

    const blogFromList = blogs.find((row) => row._id === blogId);
    if (blogFromList) {
      setLinkedBlog(blogFromList);
      return;
    }

    let cancelled = false;
    void fetchBlogById(blogId, activeStoreId)
      .then((blog) => {
        if (!cancelled) setLinkedBlog(blog);
      })
      .catch(() => {
        if (!cancelled) setLinkedBlog(null);
      });

    return () => {
      cancelled = true;
    };
  }, [blogId, activeStoreId, blogs, fetchBlogById]);

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

  const handleImageSelected = (asset: SelectedImageAsset) => {
    setFeaturedImageUrl(asset.url);
    setFeaturedImageKey(asset.key);
    setFeaturedImageUploadId(asset.uploadId);
  };

  const handleRemoveImage = () => {
    setFeaturedImageUrl('');
    setFeaturedImageKey('');
    setFeaturedImageUploadId('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!activeStoreId || !articleId) {
      toast.error('Select a store before saving');
      return;
    }
    if (!blogId) {
      toast.error('Select a blog before saving');
      return;
    }

    try {
      setSaving(true);
      const post = await updateBlogPost(articleId, {
        storeId: activeStoreId,
        blogId,
        title: title.trim(),
        content,
        excerpt,
        pageTitle: pageTitle.trim() || undefined,
        metaDescription: metaDescription.trim(),
        urlHandle: urlHandle.trim() || undefined,
        visibility,
        author: author.trim(),
        tagIds: selectedTagIds,
        featuredImageUrl,
        featuredImageKey,
        featuredImageUploadId,
      });
      const snapshot = snapshotFromPost(post);
      setInitial(snapshot);
      toast.success('Blog post saved');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save blog post';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDismissArticleAddedBanner = useCallback(() => {
    setShowArticleAddedBanner(false);
  }, []);

  const handleAddAnotherArticle = useCallback(() => {
    navigate('/content/articles/new');
  }, [navigate]);

  const handleConfirmDelete = async () => {
    if (!articleId || !activeStoreId) return;

    try {
      setDeleting(true);
      await deleteBlogPost(articleId, activeStoreId);
      toast.success('Blog post deleted');
      setDeleteModalOpen(false);
      navigate('/content/articles');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete blog post';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (!articleId) {
    return (
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-admin-text-secondary">
        Blog post not found.
      </div>
    );
  }

  if (!loaded) {
    return <BlogPostFormPageSkeleton />;
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/content/articles"
              className={iconButtonClass}
              aria-label="Back to blog posts"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <h1 className="truncate text-[15px] font-semibold text-admin-text">
              {title.trim() || initial?.title || 'Blog post'}
            </h1>
            {loaded ? <VisibilityBadge visibility={visibility} /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              type="button"
              onClick={() => navigate(`/content/comments/article/${articleId}`)}
              className={adminListSecondaryButtonClass}
            >
              Manage comments
            </button>

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
                <div className="absolute right-0 z-20 mt-1 min-w-44 overflow-hidden rounded-xl border border-admin-border bg-admin-surface py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-admin-row-hover"
                  >
                    Delete blog post
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled={!previousPostId}
              onClick={() => previousPostId && navigate(`/content/articles/${previousPostId}`)}
              className={iconButtonClass}
              aria-label="Previous blog post"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextPostId}
              onClick={() => nextPostId && navigate(`/content/articles/${nextPostId}`)}
              className={iconButtonClass}
              aria-label="Next blog post"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showArticleAddedBanner ? (
          <ArticleAddedBanner
            articleTitle={title.trim() || initial?.title || 'Article'}
            onDismiss={handleDismissArticleAddedBanner}
            onAddAnother={handleAddAnotherArticle}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-admin-border bg-admin-surface p-4 sm:p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="blog-post-title-edit" className={fieldLabelClass}>
                    Title
                  </label>
                  <div className="relative">
                    <input
                      id="blog-post-title-edit"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={fieldInputClass}
                    />
                    <SparklesIcon
                      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued"
                      aria-hidden
                    />
                  </div>
                </div>

                <div>
                  <label className={fieldLabelClass}>Content</label>
                  <ProductDescriptionInput
                    value={content}
                    onChange={setContent}
                    hideLabel
                    placeholder="Write your blog post..."
                    enableTemplates={false}
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
              <div className="flex items-center justify-between gap-3 border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
                <h2 className="text-[13px] font-semibold text-admin-text">Excerpt</h2>
                <button
                  type="button"
                  onClick={() => setExcerptEditing((value) => !value)}
                  className="rounded-lg p-1 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                  aria-expanded={excerptEditing}
                  aria-label={excerptEditing ? 'Close excerpt editor' : 'Edit excerpt'}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                {!excerptEditing ? (
                  <p className="text-[13px] text-admin-text-secondary">
                    {excerptEmpty
                      ? 'Add a summary of the post to appear on your home page or blog.'
                      : excerpt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[13px] text-admin-text-secondary">
                      Add a summary of the post to appear on your home page or blog.
                    </p>
                    <ProductDescriptionInput
                      value={excerpt}
                      onChange={setExcerpt}
                      hideLabel
                      placeholder="Write an excerpt..."
                      enableImages={false}
                      enableTemplates={false}
                    />
                  </div>
                )}
              </div>
            </section>

            <SearchEngineListingEditor
              entityTitle={title}
              entityDescription={excerpt || content}
              pageTitle={pageTitle}
              metaDescription={metaDescription}
              urlHandle={urlHandle}
              urlPrefix={selectedBlog ? `blogs/${selectedBlog.urlHandle}` : 'blogs'}
              fallbackSlug="blog-post"
              urlOrigin={storefrontBase || undefined}
              metaDescriptionMax={SNIPPET_MAX}
              onPageTitleChange={setPageTitle}
              onMetaDescriptionChange={setMetaDescription}
              onUrlHandleChange={setUrlHandle}
              compact
            />
          </div>

          <div className="flex flex-col gap-4">
            <BlogPostCard
              title="Visibility"
              action={<CalendarDaysIcon className="h-4 w-4 text-admin-text-subdued" aria-hidden />}
            >
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="blog-post-visibility-edit"
                    checked={visibility === 'visible'}
                    onChange={() => setVisibility('visible')}
                    className={radioClass}
                  />
                  Visible
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="blog-post-visibility-edit"
                    checked={visibility === 'hidden'}
                    onChange={() => setVisibility('hidden')}
                    className={radioClass}
                  />
                  Hidden
                </label>
              </div>
            </BlogPostCard>

            <BlogPostCard title="Image">
              {featuredImageUrl ? (
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-lg border border-admin-border">
                    <img
                      src={featuredImageUrl}
                      alt="Blog post featured"
                      className="h-40 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePickerOpen(true)}
                    className={`text-[12px] font-medium ${adminListFooterLinkClass}`}
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-admin-border bg-admin-fill/40 px-4 py-6 text-center">
                  <button
                    type="button"
                    onClick={() => setImagePickerOpen(true)}
                    className={adminListSecondaryButtonClass}
                  >
                    Add image
                  </button>
                  <p className="mt-2 text-[12px] text-admin-text-subdued">
                    Choose from your store files or upload a new image
                  </p>
                </div>
              )}
            </BlogPostCard>

            <BlogPostCard title="Organization">
              <div className="space-y-3">
                <div>
                  <label htmlFor="blog-post-author-edit" className={fieldLabelClass}>
                    Author
                  </label>
                  <input
                    id="blog-post-author-edit"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={fieldInputPlainClass}
                  />
                </div>
                <div>
                  <label htmlFor="blog-post-blog-edit" className={fieldLabelClass}>
                    Blog
                  </label>
                  <select
                    id="blog-post-blog-edit"
                    value={blogId}
                    onChange={(e) => setBlogId(e.target.value)}
                    className={fieldInputPlainClass}
                  >
                    {blogs.length === 0 ? (
                      <option value="">No blogs available</option>
                    ) : (
                      blogs.map((row) => (
                        <option key={row._id} value={row._id}>
                          {row.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <BlogTagsInput
                  selectedTagIds={selectedTagIds}
                  activeStoreId={activeStoreId}
                  onTagsChange={setSelectedTagIds}
                  inputId="blog-tags-edit"
                />
              </div>
            </BlogPostCard>
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

      <SelectImageModal
        open={imagePickerOpen}
        initialUrl={featuredImageUrl}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelected}
      />

      <DeleteBlogPostModal
        isOpen={deleteModalOpen}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteModalOpen(false);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
};
