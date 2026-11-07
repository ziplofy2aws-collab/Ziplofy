'use client';
import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';
import ClientSidebar from '@/components/layout/ClientSidebar';
import Header from '@/components/layout/Header';
import CallProvider from '@/contexts/CallProvider';
import { I18nProvider } from '@/lib/i18n';
import PageHelp from '@/components/PageHelp';
import NotificationProvider from '@/components/NotificationProvider';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { useAuthStore } from '@/stores/authStore';
import { GATEWAY_LOGOUT_URL } from '@/lib/gateway';
import { useStoreStore } from '@/stores/storeStore';
import { authApi } from '@/lib/api';
import AppStatusScreen from '@/components/status/AppStatusScreen';
import AuthPageBackdrop, { BrandMark } from '@/components/status/AuthPageBackdrop';
import PageTransition from '@/components/transitions/PageTransition';
import { FlowButton } from '@/components/ui/flow-button';
import DashboardBusyBridge from '@/components/status/DashboardBusyBridge';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadUser, user, workspaces } = useAuthStore();
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const [maintenance, setMaintenance] = useState<{ isEnabled: boolean; message: string } | null>(null);
  const [onboardingReady, setOnboardingReady] = useState(false);

  const isInformaticThemeEditor =
    pathname === '/client/themes/informatic-editor' ||
    Boolean(pathname?.startsWith('/client/themes/informatic-editor/'));

  const isOnboardingRoute =
    pathname === '/client/manage-profile' ||
    pathname === '/client/workspace' ||
    Boolean(pathname?.startsWith('/client/manage-profile/')) ||
    Boolean(pathname?.startsWith('/client/workspace/'));

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const role = (user as unknown as { role?: string })?.role;
    if (role === 'vendor') {
      void fetchStores();
    }
  }, [isLoading, isAuthenticated, user, fetchStores]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      try {
        sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
      } catch {
        /* */
      }
      window.location.assign(GATEWAY_LOGOUT_URL);
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    const r = (user as unknown as { role?: string })?.role;
    if (r === 'admin' || r === 'super_admin') {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Vendor onboarding gate: profile → workspace → dashboard.
  // Depend on user id/role only — service toggles update featureOverrides and must not re-gate.
  const userId = user?._id;
  const userRole = (user as unknown as { role?: string } | null)?.role;
  useEffect(() => {
    if (isLoading || !isAuthenticated || !userId) return;
    if (userRole !== 'vendor') {
      setOnboardingReady(true);
      return;
    }
    let cancelled = false;
    authApi
      .onboardingStatus()
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        const next = data.nextPath || '/client/dashboard';
        const onManage = pathname?.startsWith('/client/manage-profile');
        const onWorkspace = pathname?.startsWith('/client/workspace');
        if (!data.profileComplete && !onManage) {
          router.replace('/client/manage-profile');
          return;
        }
        if (data.profileComplete && data.workspaceCount === 0 && !onWorkspace && !onManage) {
          router.replace('/client/workspace');
          return;
        }
        // Let workspace page finish confetti → loader → dashboard without a mid-celebration yank.
        let celebrating = false;
        try {
          celebrating = sessionStorage.getItem('workspaceCelebrate') === '1';
        } catch {
          /* ignore */
        }
        if (data.profileComplete && data.workspaceCount > 0 && (onManage || onWorkspace) && !celebrating) {
          router.replace('/client/dashboard');
          return;
        }
        // Soft check: if workspaces already in store but API count lags
        if (data.profileComplete && (workspaces?.length || 0) > 0 && onWorkspace && !celebrating) {
          router.replace('/client/dashboard');
          return;
        }
        void next;
      })
      .catch(() => {
        /* allow page to render; page-level fetch will surface errors */
      })
      .finally(() => {
        if (!cancelled) setOnboardingReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, userId, userRole, pathname, router, workspaces]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    const staffType = (user as unknown as { staffType?: string })?.staffType;
    if (staffType === 'doctor' && pathname === '/client/dashboard') {
      router.replace('/client/clinic/queue');
    }
    if (staffType === 'teacher' && pathname === '/client/dashboard') {
      router.replace('/client/edtech/overview');
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://api.wabapanel.com/api').replace(/\/api$/, '');
    fetch(apiBase + '/api/maintenance-status')
      .then((r) => r.json())
      .then((d) => setMaintenance(d.data || null))
      .catch(() => setMaintenance(null));
  }, [isLoading, isAuthenticated]);

  if (isLoading || !onboardingReady) {
    return <AppStatusScreen variant="loading" />;
  }

  if (!isAuthenticated || !user) return null;

  {
    const r = (user as unknown as { role?: string })?.role;
    if (r === 'admin' || r === 'super_admin') return null;
  }

  const role = (user as unknown as { role?: string })?.role;
  if (maintenance?.isEnabled && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Under Maintenance</h2>
          <p className="text-gray-500">
            {maintenance.message || 'We are currently under maintenance. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  if (isInformaticThemeEditor) {
    return (
      <I18nProvider>
        <CallProvider>
          <NotificationProvider />
          <DashboardBusyBridge />
          {children}
        </CallProvider>
      </I18nProvider>
    );
  }

  // Slim chrome for onboarding (manage-profile / create workspace).
  if (isOnboardingRoute) {
    let hideChrome = false;
    try {
      hideChrome = sessionStorage.getItem('workspaceCelebrate') === '1';
    } catch {
      /* ignore */
    }
    return (
      <I18nProvider>
        <CallProvider>
          <NotificationProvider />
          <DashboardBusyBridge />
          <AuthPageBackdrop>
            {!hideChrome ? (
              <header className="px-4 pt-4 sm:px-6">
                <div className="mx-auto flex max-w-[980px] items-center justify-between rounded-2xl border border-white/70 bg-white/40 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:px-5">
                  <BrandMark size="sm" />
                  <FlowButton
                    frost
                    text="Log out"
                    onClick={() => {
                      useAuthStore.getState().logout(GATEWAY_LOGOUT_URL);
                    }}
                  />
                </div>
              </header>
            ) : null}
            <main className={hideChrome ? '' : 'p-4 sm:p-6 lg:p-8'}>
              <PageTransition>{children}</PageTransition>
            </main>
          </AuthPageBackdrop>
        </CallProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <CallProvider>
        <NotificationProvider />
        <DashboardBusyBridge />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <div className="client-orbitly-shell flex h-screen flex-col overflow-hidden antialiased text-admin-text">
          <Header variant="shopify" />
          <div className="relative flex min-h-0 flex-1 pt-14">
            <ClientSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <AnnouncementBanner />
              <main className="client-orbitly-main min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <PageTransition>{children}</PageTransition>
              </main>
              <PageHelp />
            </div>
          </div>
        </div>
      </CallProvider>
    </I18nProvider>
  );
}
