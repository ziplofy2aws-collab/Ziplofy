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
        if (data.profileComplete && data.workspaceCount > 0 && (onManage || onWorkspace)) {
          router.replace('/client/dashboard');
          return;
        }
        // Soft check: if workspaces already in store but API count lags
        if (data.profileComplete && (workspaces?.length || 0) > 0 && onWorkspace) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-3">Loading...</p>
        </div>
      </div>
    );
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
          {children}
        </CallProvider>
      </I18nProvider>
    );
  }

  // Slim chrome for onboarding (manage-profile / create workspace).
  if (isOnboardingRoute) {
    return (
      <I18nProvider>
        <CallProvider>
          <NotificationProvider />
          <div className="min-h-screen bg-page-background-color antialiased text-admin-text">
            <header className="border-b border-admin-border bg-white px-4 py-3 sm:px-6">
              <div className="mx-auto flex max-w-[1000px] items-center justify-between">
                <p className="text-[15px] font-semibold">Codiic</p>
                <button
                  type="button"
                  className="text-[13px] font-medium text-admin-text-secondary hover:text-admin-text"
                  onClick={() => {
                    useAuthStore.getState().logout(GATEWAY_LOGOUT_URL);
                  }}
                >
                  Log out
                </button>
              </div>
            </header>
            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </CallProvider>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <CallProvider>
        <NotificationProvider />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <div className="flex h-screen flex-col overflow-hidden bg-page-background-color antialiased text-admin-text">
          <Header variant="shopify" />
          <div className="relative flex min-h-0 flex-1 pt-14">
            <ClientSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <AnnouncementBanner />
              <main className="min-h-0 flex-1 overflow-y-auto bg-page-background-color p-4 sm:p-6 lg:p-8">
                {children}
              </main>
              <PageHelp />
            </div>
          </div>
        </div>
      </CallProvider>
    </I18nProvider>
  );
}
