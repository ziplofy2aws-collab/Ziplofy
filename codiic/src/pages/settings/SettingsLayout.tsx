import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_SIDEBAR_WIDTH } from '../../components/admin-sidebar';
import SettingsSidebar from '../../components/SettingsSidebar';

const NAVBAR_HEIGHT = 56; // keep consistent with main Navbar (h-14 = 56px)

const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div
      className="bg-page-background-color"
      style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
    >
      <SettingsSidebar currentPath={currentPath} onNavigate={handleNavigate} onBack={handleBack} />
      {/* Mirror App.tsx home main: sidebar width offset + same page padding */}
      <main
        className="min-h-[calc(100vh-56px)] w-full overflow-y-auto p-4 antialiased text-admin-text sm:p-6 lg:p-8"
        style={{
          marginLeft: `${ADMIN_SIDEBAR_WIDTH}px`,
          width: `calc(100% - ${ADMIN_SIDEBAR_WIDTH}px)`,
        }}
      >
        <div className="mx-auto w-full max-w-[1280px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;
