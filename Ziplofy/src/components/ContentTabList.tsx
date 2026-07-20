import ContentTabButton from './ContentTabButton';

interface ContentTab {
  label: string;
}

interface ContentTabListProps {
  tabs: ContentTab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function ContentTabList({ tabs, activeIndex, onChange }: ContentTabListProps) {
  return (
    <>
      {tabs.map((t, idx) => {
        const active = activeIndex === idx;
        return (
          <ContentTabButton
            key={t.label}
            label={t.label}
            active={active}
            onClick={() => onChange(idx)}
          />
        );
      })}
    </>
  );
}

