import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { adminContentColumnClass } from './admin-page-width';

/**
 * Wraps most admin routes with a centered max-width column so pages look consistent
 * without editing every screen. Full-width and immersive routes opt out.
 */
function isImmersiveOrFullWidthPath(pathname: string): boolean {
  if (pathname.startsWith('/settings')) return true;
  if (pathname.startsWith('/themes/code-fullscreen/')) return true;
  if (pathname.startsWith('/themes/builder')) return true;
  if (pathname.startsWith('/themes/basic-elementor')) return true;
  if (pathname.startsWith('/themes/edit/')) return true;
  if (pathname.startsWith('/themes/dev-editor')) return true;
  if (/^\/themes\/[^/]+\/editor\/?$/.test(pathname)) return true;
  if (pathname.startsWith('/themes/layout/')) return true;
  if (pathname.startsWith('/themes/code/')) return true;
  return false;
}

/** Pages that fill the main pane and own their own scroll (no page-level scroll). */
function isViewportLockedPath(pathname: string): boolean {
  return pathname === '/products/inventory' || pathname === '/analytics/live-view';
}

const AdminStandardLayout: React.FC = () => {
  const { pathname } = useLocation();

  if (isImmersiveOrFullWidthPath(pathname)) {
    return <Outlet />;
  }

  if (isViewportLockedPath(pathname)) {
    return (
      <div className={`${adminContentColumnClass} flex h-full min-h-0 flex-1 flex-col overflow-hidden`}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className={adminContentColumnClass}>
      <Outlet />
    </div>
  );
};

export default AdminStandardLayout;
