import React from 'react';
import InstalledThemesGrid from './InstalledThemesGrid';

interface InstalledThemesSectionProps {
  installedThemes: any[];
  viewMode: "grid" | "list";
  onUninstall: (themeId: string) => void;
}

const InstalledThemesSection: React.FC<InstalledThemesSectionProps> = ({
  installedThemes,
  viewMode,
  onUninstall,
}) => {
  if (!Array.isArray(installedThemes) || installedThemes.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-3 text-base font-medium text-gray-900">Installed themes</h2>
      <InstalledThemesGrid
        installedThemes={installedThemes}
        viewMode={viewMode}
        onUninstall={onUninstall}
      />
    </>
  );
};

export default InstalledThemesSection;

