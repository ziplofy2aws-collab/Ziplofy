import { GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InlineWidget } from 'react-calendly';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/product.context';
import { useSocket } from '../contexts/socket.context';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { useUserContext } from '../contexts/user.context';
import { SocketEventType } from '../types/event.types';
import CustomizeDomainCard from './CustomizeDomainCard';
import DashboardContent from './DashboardContent';
import DashboardEmptySetupGuide from './DashboardEmptySetupGuide';
import DashboardUpgradeBanner from './DashboardUpgradeBanner';
import GettingStartedPage from './GettingStartedPage';
import OnboardingTour from './OnboardingTour';

export default function HomePage() {
  const navigate = useNavigate();
  const [showCalendlyModal, setShowCalendlyModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'getting-started'>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const { socket } = useSocket();
  const { loggedInUser } = useUserContext();
  const { activeStoreId } = useStore();
  const { storeSubdomain, getByStoreId } = useStoreSubdomain();
  const { products, loading: productsLoading, fetchProductsByStoreId } = useProducts();

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId);
    }
  }, [activeStoreId, getByStoreId]);

  useEffect(() => {
    if (activeStoreId) {
      void fetchProductsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchProductsByStoreId]);

  const isEmptyStore = !productsLoading && products.length === 0;
  const storefrontHref = storeSubdomain?.url?.trim() || undefined;

  // Tour is now only shown when user clicks "Show Tour" button in navbar
  // Automatic first-time tour is disabled

  // Listen for "Show Tour" button click from navbar
  useEffect(() => {
    const handleShowTour = () => {
      setShowOnboarding(true);
    };
    window.addEventListener('codiic-show-tour', handleShowTour);
    return () => {
      window.removeEventListener('codiic-show-tour', handleShowTour);
    };
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleHireDeveloperClick = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('hireDeveloper');
    } else {
      toast.error('socket not connected');
    }
  }, [socket]);

  const handleEndMeetingClick = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit(SocketEventType.EndMeeting);
      toast.success('we have notified the developer to send requirements form, so that you can approve it');
    } else {
      toast.error('Socket not connected');
    }
    // @ts-ignore
  }, [socket, loggedInUser?.assignedSupportDeveloperId?.id]);

  const handleScheduleMeetingClick = useCallback(() => {
    setShowCalendlyModal(true);
  }, []);

  // Handle step clicks in Getting Started page
  const handleStepClick = useCallback((stepId: string) => {
    switch (stepId) {
      case 'items':
        navigate('/products');
        break;
      case 'theme':
        navigate('/themes/all-themes');
        break;
      case 'domain':
        navigate('/settings/domains');
        break;
      case 'shipping':
        navigate('/settings/shipping-and-delivery');
        break;
      case 'payment':
        navigate('/settings/payments');
        break;
      default:
        console.log('Step clicked:', stepId);
    }
  }, [navigate]);

  const handleEmptySetupAddProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  const handleEmptySetupChooseTheme = useCallback(() => {
    navigate('/themes/all-themes');
  }, [navigate]);

  const handleEmptySetupPayments = useCallback(() => {
    navigate('/settings/payments');
  }, [navigate]);

  const handleEmptySetupNameStore = useCallback(() => {
    navigate('/settings/general');
  }, [navigate]);

  const handleEmptySetupDomain = useCallback(() => {
    navigate('/settings/domains');
  }, [navigate]);

  const handleEmptySetupShipping = useCallback(() => {
    navigate('/settings/shipping-and-delivery');
  }, [navigate]);

  // Handle improvement item clicks in Getting Started page
  const handleImprovementClick = useCallback((itemId: string) => {
    switch (itemId) {
      case 'taxes':
        navigate('/settings/taxes-and-duties');
        break;
      case 'collections':
        navigate('/products/collections');
        break;
      case 'coupons':
        navigate('/discounts');
        break;
      case 'shipping':
        navigate('/settings/shipping-and-delivery');
        break;
      case 'digital-downloads':
        navigate('/settings/digital-downloads');
        break;
      default:
        console.log('Improvement item clicked:', itemId);
    }
  }, [navigate]);

  // Get the assigned developer's Calendly URL - memoized to prevent re-renders
  const getCalendlyUrl = useMemo((): string => {
    if (!loggedInUser?.assignedSupportDeveloperId) {
      console.log('No assigned developer found');
      return 'https://calendly.com/default/30min';
    }

    // Use the support developer's email to construct Calendly URL
    // @ts-ignore
    const developerEmail = loggedInUser.assignedSupportDeveloperId?.email;
    console.log('Developer email:', developerEmail);

    // Extract username from email (part before @)
    // const emailUsername = developerEmail.split("@")[0];
    const emailUsername = 'gibberish';
    console.log('Extracted username:', emailUsername);

    // Construct Calendly URL using the email username
    const calendlyUrl = `https://calendly.com/${emailUsername}/30min`;
    console.log('Generated Calendly URL:', calendlyUrl);

    return calendlyUrl;
  }, [loggedInUser?.assignedSupportDeveloperId]);

  const handleCloseCalendlyModal = useCallback(() => {
    setShowCalendlyModal(false);
  }, []);

  // Handle click outside modal
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseCalendlyModal();
      }
    },
    [handleCloseCalendlyModal]
  );

  // Handle Escape key press
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCalendlyModal) {
        handleCloseCalendlyModal();
      }
    },
    [showCalendlyModal, handleCloseCalendlyModal]
  );

  // Handle modal stop propagation
  const handleModalClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  // Handle action button clicks
  const handleAskAIClick = useCallback(() => {
    // TODO: Implement Ask AI functionality
    console.log('Ask AI clicked');
  }, []);

  const handleGetTasksUpdatesClick = useCallback(() => {
    // TODO: Implement Get tasks updates functionality
    console.log('Get tasks updates clicked');
  }, []);

  const handleCreateWorkspaceClick = useCallback(() => {
    // TODO: Implement Create workspace functionality
    console.log('Create workspace clicked');
  }, []);

  const handleConnectAppsClick = useCallback(() => {
    // TODO: Implement Connect apps functionality
    console.log('Connect apps clicked');
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    if (showCalendlyModal) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showCalendlyModal, handleClickOutside]);

  // Close modal when pressing Escape
  useEffect(() => {
    if (showCalendlyModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCalendlyModal, handleEscape])

  // Get user's first name for greeting
  const userName = loggedInUser?.name?.split(' ')[0] || 'User';

  return (
    <>
      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      <div className="w-full">
        <div className="mx-auto max-w-[1400px]">
          {/* Top: greeting + primary action */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text sm:text-2xl">
                {isEmptyStore
                  ? `Welcome${userName !== 'User' ? `, ${userName}` : ''}`
                  : `Welcome back${userName !== 'User' ? `, ${userName}` : ''}`}
              </h1>
              <p className="mt-1.5 text-[13px] text-admin-text-secondary">
                {isEmptyStore
                  ? "Let's get your store ready to sell."
                  : "Here's what's happening with your store today."}
              </p>
            </div>
            {storefrontHref ? (
              <a
                href={storefrontHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                <GlobeAltIcon className="h-4 w-4" aria-hidden />
                Open store
              </a>
            ) : null}
          </div>

          <div className="mb-8 space-y-6">
            <DashboardUpgradeBanner />

            {/* Tabs — Shopify-style gray selected chip */}
            <div
              className="inline-flex w-fit items-center gap-0.5 rounded-xl border border-admin-border bg-admin-surface p-1"
              role="tablist"
              aria-label="Home sections"
            >
              {(['dashboard', 'getting-started'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'text-admin-text'
                      : 'text-admin-text-secondary hover:bg-admin-row-hover hover:text-admin-text'
                  } relative rounded-lg px-4 py-1.5 text-[13px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#005bd3]/30`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="home-tab-bubble"
                      className="absolute inset-0 z-0 bg-admin-fill"
                      style={{ borderRadius: 8 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === 'dashboard' ? 'Dashboard' : 'Getting started'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeTab === 'dashboard' ? (
            <div key="dashboard" className="flex flex-col gap-6 animate-tab-fade">
              {productsLoading ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="min-h-[280px] animate-pulse rounded-xl border border-admin-border bg-admin-surface"
                    />
                  ))}
                </div>
              ) : isEmptyStore ? (
                <DashboardEmptySetupGuide
                  onAddProduct={handleEmptySetupAddProduct}
                  onChooseTheme={handleEmptySetupChooseTheme}
                  onSetupPayments={handleEmptySetupPayments}
                  onNameStore={handleEmptySetupNameStore}
                  onSetupDomain={handleEmptySetupDomain}
                  onReviewShipping={handleEmptySetupShipping}
                />
              ) : (
                <>
                  <DashboardContent />
                  <CustomizeDomainCard />
                </>
              )}
            </div>
          ) : (
            <div key="getting-started" className="animate-tab-fade">
              <GettingStartedPage onStepClick={handleStepClick} onImprovementClick={handleImprovementClick} />
            </div>
          )}
        </div>
      </div>

      {/* Calendly Modal */}
      {showCalendlyModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1400]"
            onClick={handleCloseCalendlyModal}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 pointer-events-none">
            <div
              ref={modalRef}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl pointer-events-auto"
              onClick={handleModalClick}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseCalendlyModal}
                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white/90 rounded-lg transition-colors z-10"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="relative h-[80vh] min-h-[600px]">
                <InlineWidget
                  url={getCalendlyUrl}
                  styles={{
                    height: '100%',
                    width: '100%',
                  }}
                  pageSettings={{
                    backgroundColor: 'ffffff',
                    hideEventTypeDetails: false,
                    hideLandingPageDetails: false,
                    primaryColor: '4caf50',
                    textColor: '4d5055',
                  }}
                  prefill={{
                    name: loggedInUser?.name || '',
                    email: loggedInUser?.email || '',
                  }}
                  utm={{
                    utmCampaign: 'developer-meeting',
                    utmSource: 'codiic',
                    utmMedium: 'website',
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
  