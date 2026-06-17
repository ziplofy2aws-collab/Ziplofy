import SettingsSidebarItem, { SettingsNavItem } from './SettingsSidebarItem';

interface SettingsSidebarNavListProps {
  items: SettingsNavItem[];
  currentPath: string;
  expanded: Record<string, boolean>;
  isActivePath: (path?: string) => boolean;
  onItemClick: (item: SettingsNavItem) => void;
  onChildClick: (path?: string) => void;
}

export default function SettingsSidebarNavList({
  items,
  currentPath,
  expanded,
  isActivePath,
  onItemClick,
  onChildClick,
}: SettingsSidebarNavListProps) {
  const matchesItemPath = (item: SettingsNavItem): boolean => {
    if (!item.path) return false;
    if (isActivePath(item.path) || currentPath.startsWith(`${item.path}/`)) return true;
    return (item.matchPrefixes ?? []).some(
      (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)
    );
  };

  return (
    <ul className="m-0 list-none p-2">
      {items.map((item) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const itemKey = item.path || item.text;
        const childActive = hasChildren
          ? item.children!.some((child) => isActivePath(child.path))
          : false;
        const isCurrentPath = hasChildren
          ? childActive || matchesItemPath(item)
          : matchesItemPath(item);
        const isExpanded = hasChildren ? expanded[itemKey] ?? childActive : false;

        return (
          <SettingsSidebarItem
            key={itemKey}
            item={item}
            isCurrentPath={isCurrentPath}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onItemClick={onItemClick}
            onChildClick={onChildClick}
            isActivePath={isActivePath}
          />
        );
      })}
    </ul>
  );
}

