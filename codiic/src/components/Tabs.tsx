import React from 'react';
import TabButton from './TabButton';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
}) => {
  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <TabButton
            key={t.id}
            id={t.id}
            label={t.label}
            isActive={activeTab === t.id}
            onClick={onTabChange}
            variant="pills"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 border-b border-gray-200/80 overflow-x-auto" role="tablist">
      {tabs.map((t) => (
        <TabButton
          key={t.id}
          id={t.id}
          label={t.label}
          isActive={activeTab === t.id}
          onClick={onTabChange}
          variant="underline"
        />
      ))}
    </div>
  );
};

export default Tabs;
