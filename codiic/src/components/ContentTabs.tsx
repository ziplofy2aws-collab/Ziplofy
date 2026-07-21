import ContentTabList from './ContentTabList';

interface ContentTab {
  label: string;
}

interface ContentTabsProps {
  tabs: ContentTab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function ContentTabs({ tabs, activeIndex, onChange }: ContentTabsProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200/80" role="tablist" aria-label="Metaobjects tabs">
      <ContentTabList tabs={tabs} activeIndex={activeIndex} onChange={onChange} />
    </div>
  );
}

