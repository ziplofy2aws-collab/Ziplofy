'use client';

import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Hash,
  ChevronDown,
  ChevronRight,
  Inbox,
  Calendar,
  Activity,
  CreditCard,
  Globe,
  Terminal,
  Blocks,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
} from 'lucide-react';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const mockNavGroups: NavGroupData[] = [
  {
    items: [
      { id: 'search', title: 'Search', icon: Search, shortcut: '⌘K' },
      { id: 'home', title: 'Home', icon: LayoutDashboard },
      { id: 'inbox', title: 'Inbox', icon: Inbox, badge: 12 },
      { id: 'analytics', title: 'Analytics', icon: Activity },
    ],
  },
  {
    heading: 'Workspace',
    items: [
      {
        id: 'projects',
        title: 'Projects',
        icon: FolderKanban,
        children: [
          { id: 'p-active', title: 'Active', icon: Hash },
          { id: 'p-archived', title: 'Archived', icon: Hash },
        ],
      },
      { id: 'calendar', title: 'Calendar', icon: Calendar },
      {
        id: 'team',
        title: 'Team',
        icon: Users,
        children: [
          { id: 't-design', title: 'Designers', icon: Hash },
          { id: 't-eng', title: 'Engineering', icon: Hash },
          { id: 't-product', title: 'Product', icon: Hash },
        ],
      },
      {
        id: 'customers',
        title: 'Customers',
        icon: Globe,
        children: [
          { id: 'c-enterprise', title: 'Enterprise', icon: Hash },
          { id: 'c-smb', title: 'SMB', icon: Hash },
        ],
      },
      { id: 'finance', title: 'Finance', icon: CreditCard },
    ],
  },
  {
    heading: 'Developers',
    items: [
      { id: 'api', title: 'API Keys', icon: Terminal },
      { id: 'webhooks', title: 'Webhooks', icon: Blocks },
    ],
  },
];

const mockBottomItems: NavItemData[] = [
  { id: 'settings', title: 'Settings', icon: Settings, shortcut: '⌘,' },
  { id: 'logout', title: 'Log out', icon: LogOut },
];

function WorkspaceSwitcher({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (ws: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState('Acme Corp');

  const current = selected || internalSelected;
  const handleSelect = onSelect || setInternalSelected;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="group mb-4 flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-primary text-[13px] font-semibold text-primary-foreground shadow-sm">
            {current.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="mb-1 max-w-[120px] truncate text-[13px] font-medium leading-none text-foreground">
              {current}
            </span>
            <span className="text-[11px] leading-none text-muted-foreground">Pro Plan</span>
          </div>
        </div>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground/70"
          strokeWidth={1.5}
        />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-[52px] z-50 flex w-full animate-[orbitly-pop_140ms_ease-out] flex-col gap-0.5 rounded-lg border border-border/50 bg-card py-1 shadow-xl">
            {['Acme Corp', 'Personal Workspace', 'Client Sandbox'].map((ws) => (
              <div
                key={ws}
                onClick={() => {
                  handleSelect(ws);
                  setIsOpen(false);
                }}
                className={`mx-1 cursor-pointer rounded-md px-3 py-2 text-[13px] transition-colors ${
                  current === ws
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground/80 hover:bg-black/5'
                }`}
              >
                {ws}
              </div>
            ))}
            <div className="mx-2 my-1 h-px bg-border/50" />
            <div className="mx-1 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-black/5">
              <span className="mb-0.5 text-[16px] leading-none">+</span> Create Workspace
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div
        className={`group flex cursor-pointer select-none items-center justify-between rounded-[6px] px-2.5 py-[7px] transition-all duration-200 ${
          isActive
            ? 'bg-black/5 font-medium text-foreground'
            : 'text-muted-foreground hover:bg-black/5 hover:text-foreground/90'
        }`}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon
            className={`h-4 w-4 transition-colors ${
              isActive ? 'text-foreground' : 'text-muted-foreground/70 group-hover:text-foreground/70'
            }`}
            strokeWidth={1.5}
          />
          <span className="truncate text-[13px] tracking-wide">{item.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden h-5 items-center justify-center rounded-[4px] border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 shadow-sm group-hover:inline-flex">
              {item.shortcut}
            </kbd>
          )}
          {item.badge && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${
                isOpen ? 'rotate-90' : ''
              }`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="relative mt-0.5 flex min-h-0 flex-col gap-0.5 overflow-hidden">
            <div
              className="absolute bottom-0 top-0 border-l border-black/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  className = '',
  activeId,
  onSelect,
  activeWorkspace,
  onWorkspaceSelect,
}: {
  className?: string;
  activeId?: string;
  onSelect?: (id: string) => void;
  activeWorkspace?: string;
  onWorkspaceSelect?: (ws: string) => void;
}) {
  const [internalId, setInternalId] = useState('home');
  const currentId = activeId !== undefined ? activeId : internalId;
  const handleSelect = onSelect || setInternalId;

  return (
    <div
      className={`flex h-full w-[260px] flex-col border-r border-border/50 bg-card/50 p-3 font-sans ${className}`}
    >
      <WorkspaceSwitcher selected={activeWorkspace} onSelect={onWorkspaceSelect} />

      <div className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mockNavGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => (
              <NavItem key={item.id} item={item} activeId={currentId} onSelect={handleSelect} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-border/50 pt-4">
        {mockBottomItems.map((item) => (
          <NavItem key={item.id} item={item} activeId={currentId} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}

const allItems = [...mockNavGroups.flatMap((g) => g.items), ...mockBottomItems];
const flattenItems = (items: NavItemData[]): NavItemData[] =>
  items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flattenItems(item.children));
    return acc;
  }, [] as NavItemData[]);
const flatMockData = flattenItems(allItems);

/** Preview: collapsible sidebar shell (PanelLeftClose / PanelLeftOpen). */
export default function SidebarNavPreview() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('home');
  const [activeWorkspace, setActiveWorkspace] = useState('Acme Corp');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeItem = flatMockData.find((i) => i.id === activeId);
  const activeTitle = activeItem ? activeItem.title : 'Dashboard';

  const handleSelect = (id: string) => {
    if (id === 'search') {
      setIsSearchOpen(true);
      return;
    }
    setActiveId(id);
  };

  return (
    <div className="flex min-h-[700px] w-full flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="relative flex h-[700px] w-full max-w-4xl overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm ring-1 ring-black/5">
        <div
          className={`h-full shrink-0 overflow-hidden border-r border-border/50 bg-card/50 transition-all duration-300 ease-in-out ${
            isOpen ? 'w-[260px] opacity-100' : 'w-0 border-none opacity-0'
          }`}
        >
          <SidebarNav
            className="w-[260px] border-none bg-transparent"
            activeId={activeId}
            onSelect={handleSelect}
            activeWorkspace={activeWorkspace}
            onWorkspaceSelect={setActiveWorkspace}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-black/[0.02] transition-all duration-300">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-card px-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
              >
                {isOpen ? (
                  <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{activeWorkspace}</span>
                <span>/</span>
                <span className="truncate font-medium text-foreground">{activeTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden h-8 w-64 rounded-md bg-black/5 md:block" />
              <div className="h-8 w-8 rounded-full border border-primary/20 bg-primary/10" />
            </div>
          </div>

          <div className="overflow-y-auto p-6 md:p-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-8 flex items-center justify-between">
              <div className="h-8 w-48 rounded-md bg-black/5" />
            </div>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-32 rounded-xl border border-border/50 bg-card shadow-sm" />
              <div className="h-32 rounded-xl border border-border/50 bg-card shadow-sm" />
            </div>
            <div className="w-full rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="mb-6 h-5 w-1/3 rounded-md bg-black/5" />
              <div className="mb-6 h-px w-full bg-border/50" />
              <div className="flex flex-col gap-4">
                <div className="h-12 w-full rounded-lg bg-black/5" />
                <div className="h-12 w-full rounded-lg bg-black/5" />
                <div className="h-12 w-full rounded-lg bg-black/5" />
                <div className="h-12 w-full rounded-lg bg-black/5" />
              </div>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-start justify-center bg-background/40 px-4 pt-[15vh] backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <div className="relative w-full max-w-xl animate-[orbitly-pop_160ms_ease-out] overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl">
              <div className="flex items-center border-b border-border/50 px-4">
                <Search className="mr-3 h-[18px] w-[18px] shrink-0 text-muted-foreground/70" strokeWidth={1.5} />
                <input
                  autoFocus
                  className="flex-1 bg-transparent py-4 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/50"
                  placeholder="Search projects, docs, or actions..."
                />
                <kbd
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 hidden h-5 cursor-pointer items-center justify-center rounded-[4px] border border-black/10 bg-black/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70 transition-colors hover:bg-black/10 hover:text-foreground sm:inline-flex"
                >
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-3 rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-2 py-8">
                <Command className="mb-2 h-6 w-6 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-muted-foreground">Type a command or search...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
