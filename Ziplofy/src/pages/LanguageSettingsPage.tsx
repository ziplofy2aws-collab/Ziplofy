import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../components/settings/SettingsPageScaffold';

export const LanguageSettingsPage = () => {
  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Languages"
          description="Manage storefront and admin languages for your store."
          tip="Language packs and locale defaults will appear here as they become available."
        />
        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="px-6 py-12 text-center sm:px-8">
            <p className="text-sm font-medium text-gray-900">Coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">Language settings will be available here.</p>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};
