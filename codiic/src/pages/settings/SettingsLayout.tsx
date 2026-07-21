import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SettingsSidebar from '../../components/SettingsSidebar';

const NAVBAR_HEIGHT = 48; // keep consistent with main Navbar (h-12 = 48px)
const SETTINGS_SIDEBAR_WIDTH = 240;

const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname; // e.g. /settings/general

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
      <main
        className="min-h-[calc(100vh-48px)] w-full overflow-y-auto"
        style={{ paddingLeft: `${SETTINGS_SIDEBAR_WIDTH}px` }}
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SettingsLayout;


