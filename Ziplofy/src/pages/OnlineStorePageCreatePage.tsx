import {
  CalendarDaysIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import PageAddedBanner from '../components/store-pages/PageAddedBanner';
import StorePageFormPageSkeleton from '../components/store-pages/StorePageFormPageSkeleton';
import { useStorePages } from '../contexts/store-page.context';
import { useStore } from '../contexts/store.context';
import { SearchEngineListingEditor } from '../seo/SearchEngineListingEditor';
import { SNIPPET_MAX } from '../seo/seo-text.util';
import {
  consumePageJustCreated,
  consumeSkipPageLoadSkeleton,
  markPageJustCreated,
  peekPageJustCreated,
  readPageJustCreated,
} from '../utils/page-navigation.util';

type Visibility = 'visible' | 'hidden';

function PageCard({
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

export default function OnlineStorePageCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageId } = useParams<{ pageId: string }>();
  const { activeStoreId } = useStore();
  const { createPage, updatePage, deletePage, fetchPageById, loading } = useStorePages();
  const editing = Boolean(pageId);
  const previousPageIdRef = useRef(pageId);
  const [showPageAddedBanner, setShowPageAddedBanner] = useState(
    () => peekPageJustCreated(pageId) || readPageJustCreated(location.state)
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlHandle, setUrlHandle] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('hidden');
  const [themeTemplate, setThemeTemplate] = useState('default');
  const [loadingPage, setLoadingPage] = useState(
    () => editing && !peekPageJustCreated(pageId) && !readPageJustCreated(location.state)
  );

  const canSave = useMemo(
    () => title.trim().length > 0 && Boolean(activeStoreId) && !loading && !loadingPage,
    [title, activeStoreId, loading, loadingPage]
  );

  // Create + edit share this component (React often reuses the instance), so pick up
  // the "just created" flag on every navigation — not only on first mount.
  useEffect(() => {
    const fromPending = consumePageJustCreated(pageId);
    const fromState = readPageJustCreated(location.state);
    if (!fromPending && !fromState) return;
    setShowPageAddedBanner(true);
    if (fromState) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [pageId, location.key, location.state, location.pathname, navigate]);

  useEffect(() => {
    if (previousPageIdRef.current === pageId) return;
    const cameFromCreateForm = previousPageIdRef.current == null && Boolean(pageId);
    const wentToCreateForm = Boolean(previousPageIdRef.current) && pageId == null;
    previousPageIdRef.current = pageId;
    if (!cameFromCreateForm) {
      setShowPageAddedBanner(false);
    }
    if (wentToCreateForm) {
      setTitle('');
      setContent('');
      setPageTitle('');
      setMetaDescription('');
      setUrlHandle('');
      setVisibility('hidden');
      setThemeTemplate('default');
    }
  }, [pageId]);

  useEffect(() => {
    if (!pageId) {
      setLoadingPage(false);
      return;
    }
    if (!activeStoreId) {
      setLoadingPage(true);
      return;
    }
    let cancelled = false;
    const skipSkeleton = consumeSkipPageLoadSkeleton(pageId);
    if (!skipSkeleton) {
      setLoadingPage(true);
    }
    void fetchPageById(pageId, activeStoreId)
      .then((page) => {
        if (cancelled) return;
        setTitle(page.title);
        setContent(page.content);
        setPageTitle(page.pageTitle);
        setMetaDescription(page.metaDescription);
        setUrlHandle(page.urlHandle);
        setVisibility(page.visibility);
        setThemeTemplate(page.themeTemplate || 'default');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (error as { message?: string })?.message ||
          'Failed to load page';
        toast.error(message);
        navigate('/online-store/pages', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoadingPage(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageId, activeStoreId, fetchPageById, navigate]);

  const handleDismissPageAddedBanner = useCallback(() => {
    setShowPageAddedBanner(false);
  }, []);

  const handleAddAnotherPage = useCallback(() => {
    navigate('/online-store/pages/new');
  }, [navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving');
      return;
    }

    try {
      const payload = {
        storeId: activeStoreId,
        title: title.trim(),
        content,
        pageTitle: pageTitle.trim(),
        metaDescription: metaDescription.trim(),
        urlHandle: urlHandle.trim() || undefined,
        visibility,
        themeTemplate,
      };
      if (pageId) {
        await updatePage(pageId, payload);
        toast.success('Page updated');
        return;
      }
      const saved = await createPage(payload);
      const createdId = String(saved._id);
      toast.success('Page created');
      markPageJustCreated(createdId);
      setShowPageAddedBanner(true);
      navigate(`/online-store/pages/${createdId}`, {
        replace: true,
        state: { pageJustCreated: true },
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (error as { message?: string })?.message ||
        'Failed to save page';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!pageId || !activeStoreId) return;
    if (!window.confirm(`Delete “${title || 'this page'}”? This cannot be undone.`)) return;
    try {
      await deletePage(pageId, activeStoreId);
      toast.success('Page deleted');
      navigate('/online-store/pages', { replace: true });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (error as { message?: string })?.message ||
        'Failed to delete page';
      toast.error(message);
    }
  };

  const pageAddedBanner = showPageAddedBanner ? (
    <PageAddedBanner
      pageTitle={title.trim() || 'page'}
      onDismiss={handleDismissPageAddedBanner}
      onAddAnother={handleAddAnotherPage}
    />
  ) : null;

  if (editing && loadingPage) {
    return <StorePageFormPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            <Link
              to="/online-store/pages"
              className="inline-flex items-center gap-1 font-normal text-gray-500 transition-colors hover:text-gray-700"
            >
              <DocumentTextIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Pages
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
            <span className="truncate font-normal text-gray-700">
              {editing ? title || 'Edit page' : 'Add page'}
            </span>
          </nav>
        </div>

        {pageAddedBanner}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-3">
            <section className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="store-page-title"
                    className="mb-1 block text-xs font-normal text-gray-500"
                  >
                    Title
                  </label>
                  <div className="relative">
                    <input
                      id="store-page-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. About us, sizing chart, FAQ"
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
                    placeholder=""
                    enableTemplates={false}
                  />
                </div>
              </div>
            </section>

            <SearchEngineListingEditor
              entityTitle={title}
              entityDescription={content}
              pageTitle={pageTitle}
              metaDescription={metaDescription}
              urlHandle={urlHandle}
              urlPrefix="pages"
              fallbackSlug="page"
              metaDescriptionMax={SNIPPET_MAX}
              onPageTitleChange={setPageTitle}
              onMetaDescriptionChange={setMetaDescription}
              onUrlHandleChange={setUrlHandle}
              compact
            />
          </div>

          <div className="flex flex-col gap-3">
            <PageCard
              title="Visibility"
              action={<CalendarDaysIcon className="h-4 w-4 text-gray-400" aria-hidden />}
            >
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="page-visibility"
                    checked={visibility === 'visible'}
                    onChange={() => setVisibility('visible')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Visible
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-normal text-gray-700">
                  <input
                    type="radio"
                    name="page-visibility"
                    checked={visibility === 'hidden'}
                    onChange={() => setVisibility('hidden')}
                    className="h-3.5 w-3.5 border-gray-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  Hidden
                </label>
              </div>
            </PageCard>

            <PageCard
              title="Template"
              action={<EyeIcon className="h-4 w-4 text-gray-400" aria-hidden />}
            >
              <select
                value={themeTemplate}
                onChange={(e) => setThemeTemplate(e.target.value)}
                aria-label="Page template"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
              >
                <option value="default">Default page</option>
              </select>
            </PageCard>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {editing ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={loading || loadingPage}
              className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete page
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="inline-flex min-w-22 items-center justify-center rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 enabled:bg-blue-600 enabled:text-white enabled:hover:bg-blue-700"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
