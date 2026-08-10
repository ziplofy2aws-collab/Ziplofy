import {
  CalendarDaysIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ProductDescriptionInput from '../components/products/ProductDescriptionInput';
import {
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../components/admin-list-ui';
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
    <section className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
      <div className="flex items-center justify-between gap-3 border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-admin-text">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass =
  'w-full rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-3 pr-9 text-[13px] font-normal text-admin-text placeholder:text-admin-text-subdued focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]/30';
const radioClass =
  'h-3.5 w-3.5 border-admin-border text-admin-text focus:ring-[#005bd3]/30';

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
  const [loadingPage, setLoadingPage] = useState(
    () => editing && !peekPageJustCreated(pageId) && !readPageJustCreated(location.state)
  );

  const canSave = useMemo(
    () => title.trim().length > 0 && Boolean(activeStoreId) && !loading && !loadingPage,
    [title, activeStoreId, loading, loadingPage]
  );

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
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex min-w-0 items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            <Link
              to="/online-store/pages"
              className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}
            >
              <DocumentTextIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Pages
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
            <span className="truncate font-medium text-admin-text">
              {editing ? title || 'Edit page' : 'Add page'}
            </span>
          </nav>
        </div>

        {pageAddedBanner}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="rounded-xl border border-admin-border bg-admin-surface p-4 sm:p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="store-page-title" className={fieldLabelClass}>
                    Title
                  </label>
                  <div className="relative">
                    <input
                      id="store-page-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. About us, sizing chart, FAQ"
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

          <div className="flex flex-col gap-4">
            <PageCard
              title="Visibility"
              action={<CalendarDaysIcon className="h-4 w-4 text-admin-text-subdued" aria-hidden />}
            >
              <div className="space-y-2.5">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="page-visibility"
                    checked={visibility === 'visible'}
                    onChange={() => setVisibility('visible')}
                    className={radioClass}
                  />
                  Visible
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
                  <input
                    type="radio"
                    name="page-visibility"
                    checked={visibility === 'hidden'}
                    onChange={() => setVisibility('hidden')}
                    className={radioClass}
                  />
                  Hidden
                </label>
              </div>
            </PageCard>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-admin-divider pt-4">
          {editing ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={loading || loadingPage}
              className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-admin-surface px-3 py-1.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete page
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/online-store/pages')}
              className={`${adminListSecondaryButtonClass} mr-auto`}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className={adminListPrimaryButtonClass}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
