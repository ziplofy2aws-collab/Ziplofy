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
  return (
    <ul className="m-0 list-none p-2">
      {items.map((item) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const itemKey = item.path || item.text;

        const activeChildPath = hasChildren
          ? [...item.children!]
              .filter(
                (child) =>
                  !!child.path &&
                  (currentPath === child.path || currentPath.startsWith(`${child.path}/`))
              )
              .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0]?.path
          : undefined;

        const sectionActive =
          isActivePath(item.path) ||
          (!!item.path && currentPath.startsWith(`${item.path}/`)) ||
          !!activeChildPath;

        // Same as main Sidebar: white pill on the leaf only
        const parentHighlighted = hasChildren
          ? sectionActive && !activeChildPath
          : sectionActive;

        const isExpanded = hasChildren ? expanded[itemKey] ?? !!activeChildPath : false;

        const activeChildIndex = hasChildren
          ? item.children!.findIndex((child) => child.path === activeChildPath)
          : -1;

        return (
          <SettingsSidebarItem
            key={itemKey}
            item={item}
            parentHighlighted={parentHighlighted}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            activeChildPath={activeChildPath}
            activeChildIndex={activeChildIndex}
            onItemClick={onItemClick}
            onChildClick={onChildClick}
          />
        );
      })}
    </ul>
  );
}
