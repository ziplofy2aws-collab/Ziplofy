import {
  SETTINGS_PAGE_CONTAINER_CLASS,
  SettingsHero,
  SettingsPanel,
} from '../components/settings/SettingsPageScaffold';

export const MetafeildsAndMetaObjectsSettingsPage = () => {
  return (
    <div className="w-full">
      <div className={SETTINGS_PAGE_CONTAINER_CLASS}>
        <SettingsHero
          title="Metafields and metaobjects"
          description="Define custom data structures for products, customers, and more."
          tip="Metafields extend your data model; metaobjects are reusable structured entries."
        />
        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="px-6 py-12 text-center sm:px-8">
            <p className="text-sm font-medium text-gray-900">Coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Metafields and metaobjects settings will be available here.
            </p>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
};
