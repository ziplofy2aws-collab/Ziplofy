import React from 'react';
import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../../components/settings/SettingsPageScaffold';

const SettingsPlaceholder: React.FC<{ title?: string }> = ({ title = 'Settings' }) => {
  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title={title}
          description="This section is not fully implemented yet. Check back later for updates."
          tip="Use the sidebar to open other settings that are ready to use."
        />
        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="px-6 py-12 text-center sm:px-8">
            <p className="text-sm font-medium text-gray-900">Coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              This settings section is not implemented yet.
            </p>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};

export default SettingsPlaceholder;
