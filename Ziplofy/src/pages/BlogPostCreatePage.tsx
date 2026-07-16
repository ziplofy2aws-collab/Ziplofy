import {
  CalendarDaysIcon,
  ChevronRightIcon,
  PencilIcon,
  PencilSquareIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import BlogTagsInput from '../components/tags/BlogTagsInput';
import {
  SelectImageModal,
  type SelectedImageAsset,
} from '../components/SelectImageModal';
import { BlogPostThemeTemplateSection } from '../components/blog-posts/BlogPostThemeTemplateSection';
import { useBlogPosts } from '../contexts/blog-post.context';
import { useBlogs } from '../contexts/blog.context';
import { useStore } from '../contexts/store.context';
import { useUserContext } from '../contexts/user.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';

type Visibility = 'visible' | 'hidden';

function BlogPostCard({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200/80 bg-white shadow-sm ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5">
        <h2 className="text-[13px] font-medium text-gray-800">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export const BlogPostCreatePage = () => {
  const navigate = useNavigate();
  const { activeStoreId, stores } = useStore();
  const { blogs, fetchBlogsByStoreId } = useBlogs();
  const { createBlogPost, loading } = useBlogPosts();
  const { loggedInUser } = useUserContext();

  const storeName = stores.find((store) => store._id === activeStoreId)?.storeName ?? 'My Store';
  const defaultAuthor = loggedInUser?.name?.trim() || `${storeName} Admin`;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptEditing, setExcerptEditing] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('hidden');
  const [author, setAuthor] = useState(defaultAuthor);
  const [blogId, setBlogId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageKey, setFeaturedImageKey] = useState('');
  const [featuredImageUploadId, setFeaturedImageUploadId] = useState('');
  const [themeTemplate, setThemeTemplate] = useState('default');
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const excerptEmpty = useMemo(() => !excerpt.replace(/<[^>]+>/g, '').trim(), [excerpt]);
  const canSave = title.trim().length > 0 && !!blogId && !saving && !loading;

  const selectedBlog = useMemo(
    () => blogs.find((row) => row._id === blogId) ?? blogs[0] ?? null,
    [blogs, blogId]
  );

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogsByStoreId]);

  useEffect(() => {
    if (!blogId && blogs.length > 0) {
      setBlogId(blogs[0]._id);
    }
  }, [blogId, blogs]);

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
    if (!activeStoreId) {
      toast.error('Select a store before saving');
      return;
    }
    if (!blogId) {
      toast.error('Select a blog before saving');
      return;
    }

    try {
      setSaving(true);
      const created = await createBlogPost({
        storeId: activeStoreId,
        blogId,
        title: title.trim(),
        content,
        excerpt,
        pageTitle: pageTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        urlHandle: urlHandle.trim() || undefined,
        visibility,
        author: author.trim() || undefined,
        tagIds: selectedTagIds,
        featuredImageUrl: featuredImageUrl || undefined,
        featuredImageKey: featuredImageKey || undefined,
        featuredImageUploadId: featuredImageUploadId || undefined,
        themeTemplate,
      });
      toast.success('Blog post saved');
      navigate(`/content/articles/${created._id}`, { state: { articleJustCreated: true } });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save blog post';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
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
            <span className="truncate font-normal text-gray-700">Add blog post</span>
          </nav>

          <Link
            to="/content/blogs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" />
            Manage blogs
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-3">
            <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="blog-post-title"
                    className="mb-1 block text-xs font-normal text-gray-500"
                  >
                    Title
                  </label>
                  <div className="relative">
                    <input
                      id="blog-post-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Blog about your latest products or deals"
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
              action={
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" aria-hidden />
              }
            >
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="blog-visibility"
                    checked={visibility === 'visible'}
                    onChange={() => setVisibility('visible')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Visible
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="blog-visibility"
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

            <BlogPostThemeTemplateSection
              storeId={activeStoreId}
              value={themeTemplate}
              onChange={setThemeTemplate}
            />

            <BlogPostCard title="Organization">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="blog-author"
                    className="mb-1 block text-xs font-normal text-gray-500"
                  >
                    Author
                  </label>
                  <input
                    id="blog-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="blog-select"
                    className="mb-1 block text-xs font-normal text-gray-500"
                  >
                    Blog
                  </label>
                  <select
                    id="blog-select"
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
                  inputId="blog-tags"
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
      </div>

      <SelectImageModal
        open={imagePickerOpen}
        initialUrl={featuredImageUrl}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelected}
      />
    </div>
  );
};
