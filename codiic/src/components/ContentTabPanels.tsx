import ContentTabPanel from './ContentTabPanel';

interface TabData {
  label: string;
  title: string;
  description: string;
  empty: string;
}

interface ContentTabPanelsProps {
  tabs: TabData[];
  activeIndex: number;
}

export default function ContentTabPanels({ tabs, activeIndex }: ContentTabPanelsProps) {
  return (
    <>
      {tabs.map((t, idx) =>
        activeIndex === idx ? (
          <ContentTabPanel
            key={t.label}
            title={t.title}
            description={t.description}
            empty={t.empty}
          />
        ) : null
      )}
    </>
  );
}

