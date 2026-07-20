import { SettingsHero, SettingsPanel } from '../components/settings/SettingsPageScaffold';

export const MarketSettingsPage = () => {
  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Markets"
          description="Configure regions, pricing, and availability for international selling."
        />
        <SettingsPanel className="p-8">
          <p className="text-center text-sm text-gray-500">Market settings will be available here.</p>
        </SettingsPanel>
      </div>
    </div>
  );
};
