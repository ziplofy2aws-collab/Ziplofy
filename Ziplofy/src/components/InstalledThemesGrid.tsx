import React from 'react';
import InstalledThemeCard from './InstalledThemeCard';

interface InstalledThemesGridProps {
  installedThemes: any[];
  viewMode: "grid" | "list";
  onUninstall: (themeId: string) => void;
}

const InstalledThemesGrid: React.FC<InstalledThemesGridProps> = ({
  installedThemes,
  viewMode,
  onUninstall,
}) => {
  return (
    <div className={`mb-4 grid gap-3 ${viewMode === "grid" ? "grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]" : "grid-cols-1"}`}>
      {installedThemes.map((it: any) => (
        <InstalledThemeCard key={it._id} theme={it} onUninstall={onUninstall} />
      ))}
    </div>
  );
};

export default InstalledThemesGrid;

