import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

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

const AdminStandardLayout: React.FC = () => {
  const { pathname } = useLocation();

  if (isImmersiveOrFullWidthPath(pathname)) {
    return <Outlet />;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Outlet />
    </div>
  );
};

export default AdminStandardLayout;
