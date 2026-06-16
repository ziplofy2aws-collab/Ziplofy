import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DeleteBlogPostModal } from '../components/DeleteBlogPostModal';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import {
  SelectImageModal,
  type SelectedImageAsset,
} from '../components/SelectImageModal';
import BlogTagsInput from '../components/tags/BlogTagsInput';
import { useBlogPosts, type BlogPost, type BlogPostVisibility } from '../contexts/blog-post.context';
import { useBlogs } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';

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
    <section className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
        <h2 className="text-[13px] font-medium text-gray-800">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
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
  const { activeStoreId } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
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

  const excerptEmpty = useMemo(() => !excerpt.replace(/<[^>]+>/g, '').trim(), [excerpt]);

  const selectedBlog = useMemo(
    () => blogs.find((row) => row._id === blogId) ?? null,
    [blogs, blogId]
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

  const storefrontBase = storeSubdomain?.url?.replace(/\/+$/, '') ?? '';
  const previewHref =
    storefrontBase && selectedBlog
      ? `${storefrontBase}/blogs/${selectedBlog.urlHandle}/${urlHandle.trim() || initial?.urlHandle || ''}`
      : '';

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
      .then((post) => {
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
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load blog post');
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, activeStoreId, fetchBlogPostById]);

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
      <div className="min-h-screen bg-page-background-color p-8 text-center text-[13px] text-gray-500">
        Blog post not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/content/articles"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
              aria-label="Back to blog posts"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <h1 className="truncate text-[15px] font-semibold text-gray-900">
              {title.trim() || initial?.title || 'Blog post'}
            </h1>
            {loaded ? <VisibilityBadge visibility={visibility} /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                Preview
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-400"
              >
                Preview
              </button>
            )}

            {articleId ? (
              <Link
                to={`/content/comments/article/${articleId}`}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
              >
                Manage comments
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-400"
              >
                Manage comments
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
                <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] font-normal text-red-600 hover:bg-gray-50"
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous blog post"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextPostId}
              onClick={() => nextPostId && navigate(`/content/articles/${nextPostId}`)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next blog post"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!loaded && loading ? (
          <p className="text-[13px] font-normal text-gray-500">Loading blog post…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <div className="flex flex-col gap-3">
                <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="blog-post-title-edit"
                        className="mb-1 block text-xs font-normal text-gray-500"
                      >
                        Title
                      </label>
                      <div className="relative">
                        <input
                          id="blog-post-title-edit"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded-md border border-gray-200 py-1.5 pl-3 pr-9 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                        />
                        <SparklesIcon
                          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300"
                          aria-hidden
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-normal text-gray-500">Content</label>
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

                <section className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
                    <h2 className="text-[13px] font-medium text-gray-800">Excerpt</h2>
                    <button
                      type="button"
                      onClick={() => setExcerptEditing((value) => !value)}
                      className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                      aria-expanded={excerptEditing}
                      aria-label={excerptEditing ? 'Close excerpt editor' : 'Edit excerpt'}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    {!excerptEditing ? (
                      <p className="text-[13px] font-normal text-gray-500">
                        {excerptEmpty
                          ? 'Add a summary of the post to appear on your home page or blog.'
                          : excerpt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[13px] font-normal text-gray-500">
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

              <div className="flex flex-col gap-3">
                <BlogPostCard
                  title="Visibility"
                  action={<CalendarDaysIcon className="h-4 w-4 text-gray-400" aria-hidden />}
                >
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                      <input
                        type="radio"
                        name="blog-post-visibility-edit"
                        checked={visibility === 'visible'}
                        onChange={() => setVisibility('visible')}
                        className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      Visible
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                      <input
                        type="radio"
                        name="blog-post-visibility-edit"
                        checked={visibility === 'hidden'}
                        onChange={() => setVisibility('hidden')}
                        className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                      />
                      Hidden
                    </label>
                  </div>
                </BlogPostCard>

                <BlogPostCard title="Image">
                  {featuredImageUrl ? (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-md border border-gray-200">
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
                        className="text-[12px] font-normal text-blue-600 hover:text-blue-700"
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-h-[140px] flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                      <button
                        type="button"
                        onClick={() => setImagePickerOpen(true)}
                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Add image
                      </button>
                      <p className="mt-2 text-[12px] font-normal text-gray-400">
                        Choose from your store files or upload a new image
                      </p>
                    </div>
                  )}
                </BlogPostCard>

                <BlogPostCard title="Organization">
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="blog-post-author-edit"
                        className="mb-1 block text-xs font-normal text-gray-500"
                      >
                        Author
                      </label>
                      <input
                        id="blog-post-author-edit"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="blog-post-blog-edit"
                        className="mb-1 block text-xs font-normal text-gray-500"
                      >
                        Blog
                      </label>
                      <select
                        id="blog-post-blog-edit"
                        value={blogId}
                        onChange={(e) => setBlogId(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
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
