import React, { Fragment, memo, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  PhotoIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { SidebarIcon, SidebarNode, ThemeEditorSidebarTab } from './create-theme-sidebar.types';
import { isSortableSidebarNode } from './create-theme-structure-order';
import { ThemeEditorSettingsSheet } from './ThemeEditorSettingsSheet';
import { ThemeSettingsNav } from './ThemeSettingsNav';
import { SectionInsertZone } from './CreateThemeSectionInsertZone';
import type { SectionCatalogGroup, SectionInsertContext } from './insert-context';
import { ThemeSectionSettingsPanel } from './ThemeSectionSettingsPanel';
import type { Collection } from '../../contexts/collection.context';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import type { ThemeEditorFieldType } from './create-theme-field.utils';
import {
  isSectionVisibilityHidden,
  sectionEnabledPathFromNodeId,
} from '../../utils/theme-editor-section-visibility.util';

function sidebarNodeIsHidden(
  node: SidebarNode,
  hiddenNodes: Record<string, boolean>,
  visibilityValues?: Record<string, string | boolean>
): boolean {
  if (node.showVisibilityToggle && sectionEnabledPathFromNodeId(node.id) && visibilityValues) {
    return isSectionVisibilityHidden(node.id, visibilityValues);
  }
  return Boolean(hiddenNodes[node.id]);
}

const SHOPIFY_BLUE = '#005bd3';
const SIDEBAR_DEPTH_STEP = 12;
const SIDEBAR_BASE_PADDING = 12;
/** Matches drag-handle + chevron columns on section rows (w-5 + w-5). */
const SIDEBAR_ROW_GUTTER = 36;

function sidebarContentPadding(depth: number): number {
  return SIDEBAR_BASE_PADDING + depth * SIDEBAR_DEPTH_STEP - 4 + SIDEBAR_ROW_GUTTER;
}

function sectionInsertGroupForLabel(label: string): SectionCatalogGroup | undefined {
  if (label === 'Header') return 'header';
  if (label === 'Template') return 'template';
  if (label === 'Footer') return 'footer';
  return undefined;
}

function allowsSectionInsertGap(prev: SidebarNode, next: SidebarNode): boolean {
  if (prev.kind === 'add-block' || next.kind === 'add-block') return false;
  if (prev.kind === 'field' || next.kind === 'field' || prev.kind === 'block' || next.kind === 'block') {
    return false;
  }
  return (
    prev.kind === 'section' ||
    next.kind === 'section' ||
    prev.kind === 'add-section' ||
    next.kind === 'add-section'
  );
}

function buildSectionInsertContext(
  groupId: SectionCatalogGroup,
  groupLabel: string,
  prev: SidebarNode,
  child: SidebarNode
): SectionInsertContext {
  return {
    groupId,
    groupLabel,
    afterNodeId: prev.kind !== 'add-section' ? prev.id : undefined,
    beforeNodeId: child.kind !== 'add-section' ? child.id : undefined,
  };
}

function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
    </svg>
  );
}

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="5" cy="3.5" r="1.15" />
      <circle cx="11" cy="3.5" r="1.15" />
      <circle cx="5" cy="8" r="1.15" />
      <circle cx="11" cy="8" r="1.15" />
      <circle cx="5" cy="12.5" r="1.15" />
      <circle cx="11" cy="12.5" r="1.15" />
    </svg>
  );
}

function SidebarRowIcon({ icon, muted }: { icon?: SidebarIcon; muted?: boolean }) {
  const cls = `h-4 w-4 shrink-0 ${muted ? 'text-white/80' : 'text-gray-500'}`;
  switch (icon) {
    case 'section':
      return <SectionIcon className={cls} />;
    case 'text':
      return <Bars3Icon className={cls} />;
    case 'title':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <text x="8" y="12" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif">
            T
          </text>
        </svg>
      );
    case 'button':
      return <CursorArrowRaysIcon className={cls} />;
    case 'image':
      return <PhotoIcon className={cls} />;
    case 'price':
      return <TagIcon className={cls} />;
    case 'product-card':
      return <ArrowPathIcon className={cls} />;
    case 'group':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 5.5h5v4H3v-4zm9 0h5v4h-5v-4zM3 10.5h5v4H3v-4zm9 0h5v4h-5v-4z"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </svg>
      );
    case 'link':
      return <LinkIcon className={cls} />;
    default:
      return <SectionIcon className={cls} />;
  }
}

type TreeRowProps = {
  node: SidebarNode;
  depth: number;
  expanded: Record<string, boolean>;
  selectedNodeId: string;
  hiddenNodes: Record<string, boolean>;
  visibilityValues?: Record<string, string | boolean>;
  onToggleExpand: (id: string) => void;
  onSelect: (node: SidebarNode) => void;
  onToggleHidden: (id: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onReorder: (listKey: string, orderedIds: string[]) => void;
  onInsertSection?: (ctx: SectionInsertContext) => void;
  onInsertHoverChange?: (ctx: SectionInsertContext | null) => void;
  sectionInsertGroup?: SectionCatalogGroup;
  sectionInsertLabel?: string;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
};

type DragState = {
  listKey: string | null;
  nodeId: string | null;
  overId: string | null;
};

function SidebarGroup({
  label,
  nodes,
  depth,
  expanded,
  selectedNodeId,
  hiddenNodes,
  visibilityValues,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDeleteNode,
  onReorder,
  onInsertSection,
  onInsertHoverChange,
  dragState,
  setDragState,
  childrenListKey,
}: Omit<TreeRowProps, 'node'> & { label: string; nodes: SidebarNode[]; childrenListKey?: string }) {
  const insertGroup = sectionInsertGroupForLabel(label);
  return (
    <>
      <p
        className="px-3 pb-1.5 pt-4 text-[15px] font-semibold text-gray-900"
        style={{ paddingLeft: SIDEBAR_BASE_PADDING + depth * SIDEBAR_DEPTH_STEP }}
      >
        {label}
      </p>
      <SortableSiblingList
        listKey={childrenListKey}
        nodes={nodes}
        depth={depth}
        expanded={expanded}
        selectedNodeId={selectedNodeId}
        hiddenNodes={hiddenNodes}
        visibilityValues={visibilityValues}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
        onToggleHidden={onToggleHidden}
        onDeleteNode={onDeleteNode}
        onReorder={onReorder}
        onInsertSection={onInsertSection}
        onInsertHoverChange={onInsertHoverChange}
        sectionInsertGroup={insertGroup}
        sectionInsertLabel={insertGroup ? label : undefined}
        dragState={dragState}
        setDragState={setDragState}
      />
    </>
  );
}

function SortableSiblingList({
  listKey,
  nodes,
  depth,
  expanded,
  selectedNodeId,
  hiddenNodes,
  visibilityValues,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDeleteNode,
  onReorder,
  onInsertSection,
  onInsertHoverChange,
  sectionInsertGroup,
  sectionInsertLabel,
  dragState,
  setDragState,
}: {
  listKey?: string;
  nodes: SidebarNode[];
} & Omit<
  TreeRowProps,
  | 'node'
  | 'onReorder'
  | 'dragState'
  | 'setDragState'
  | 'onInsertSection'
  | 'onInsertHoverChange'
  | 'sectionInsertGroup'
  | 'sectionInsertLabel'
> & {
  onReorder: (listKey: string, orderedIds: string[]) => void;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
}) {
  const sortableIds = nodes.filter(isSortableSidebarNode).map((n) => n.id);
  const canSort = Boolean(listKey && sortableIds.length > 1);

  const finishReorder = useCallback(
    (targetId: string) => {
      if (!listKey || !dragState.nodeId || dragState.nodeId === targetId) return;
      const from = sortableIds.indexOf(dragState.nodeId);
      const to = sortableIds.indexOf(targetId);
      if (from < 0 || to < 0) return;
      const next = [...sortableIds];
      next.splice(from, 1);
      next.splice(to, 0, dragState.nodeId);
      onReorder(listKey, next);
      setDragState({ listKey: null, nodeId: null, overId: null });
    },
    [dragState.nodeId, listKey, onReorder, setDragState, sortableIds]
  );

  const insertPadding = sidebarContentPadding(depth);

  return (
    <>
      {nodes.map((child, index) => {
        const prev = index > 0 ? nodes[index - 1] : null;
        const showInsert =
          sectionInsertGroup &&
          sectionInsertLabel &&
          onInsertSection &&
          prev &&
          allowsSectionInsertGap(prev, child);

        return (
          <Fragment key={child.id}>
            {showInsert ? (
              <SectionInsertZone
                paddingLeft={insertPadding}
                insertContext={buildSectionInsertContext(
                  sectionInsertGroup,
                  sectionInsertLabel,
                  prev,
                  child
                )}
                onInsert={() =>
                  onInsertSection(
                    buildSectionInsertContext(sectionInsertGroup, sectionInsertLabel, prev, child)
                  )
                }
                onHoverChange={onInsertHoverChange}
              />
            ) : null}
            <SidebarTreeRow
              node={child}
              depth={depth}
              expanded={expanded}
              selectedNodeId={selectedNodeId}
              hiddenNodes={hiddenNodes}
              visibilityValues={visibilityValues}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onToggleHidden={onToggleHidden}
              onDeleteNode={onDeleteNode}
              onReorder={onReorder}
              onInsertSection={onInsertSection}
              onInsertHoverChange={onInsertHoverChange}
              dragState={dragState}
              setDragState={setDragState}
              sortableListKey={canSort ? listKey : undefined}
              onDropOn={canSort ? finishReorder : undefined}
            />
          </Fragment>
        );
      })}
    </>
  );
}

function SidebarTreeRow({
  node,
  depth,
  expanded,
  selectedNodeId,
  hiddenNodes,
  visibilityValues,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDeleteNode,
  onReorder,
  onInsertSection,
  onInsertHoverChange,
  dragState,
  setDragState,
  sortableListKey,
  onDropOn,
}: TreeRowProps & {
  sortableListKey?: string;
  onDropOn?: (targetId: string) => void;
}) {
  if (node.kind === 'group-label') {
    return (
      <SidebarGroup
        label={node.label}
        nodes={node.children ?? []}
        depth={depth}
        expanded={expanded}
        selectedNodeId={selectedNodeId}
        hiddenNodes={hiddenNodes}
        visibilityValues={visibilityValues}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
        onToggleHidden={onToggleHidden}
        onDeleteNode={onDeleteNode}
        onReorder={onReorder}
        onInsertSection={onInsertSection}
        onInsertHoverChange={onInsertHoverChange}
        dragState={dragState}
        setDragState={setDragState}
        childrenListKey={node.childrenListKey}
      />
    );
  }

  const isAdd = node.kind === 'add-block' || node.kind === 'add-section';
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded[node.id] === true;
  const isSelected = selectedNodeId === node.id;
  const isHidden = sidebarNodeIsHidden(node, hiddenNodes, visibilityValues);
  const indent = SIDEBAR_BASE_PADDING + depth * SIDEBAR_DEPTH_STEP;
  const isDraggable = Boolean(sortableListKey && isSortableSidebarNode(node));
  const isDragOver =
    isDraggable && dragState.overId === node.id && dragState.listKey === sortableListKey;

  if (isAdd) {
    return (
      <button
        type="button"
        disabled={node.disabled}
        className="flex w-full items-center gap-1.5 py-1.5 pr-3 text-left text-[13px] font-medium hover:underline"
        style={{
          paddingLeft: sidebarContentPadding(depth),
          color: node.disabled ? '#9ca3af' : SHOPIFY_BLUE,
          cursor: node.disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => {
          if (node.disabled) return;
          onSelect(node);
        }}
      >
        <PlusCircleIcon
          className="h-4 w-4 shrink-0"
          style={{ color: node.disabled ? '#c4c7cc' : SHOPIFY_BLUE }}
        />
        {node.label}
      </button>
    );
  }

  return (
    <>
      <SidebarRow
        node={node}
        indent={indent}
        hasChildren={hasChildren}
        isOpen={isOpen}
        isSelected={isSelected}
        isHidden={isHidden}
        isDraggable={isDraggable}
        isDragOver={isDragOver}
        isDragging={dragState.nodeId === node.id}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
        onToggleHidden={onToggleHidden}
        onDeleteNode={onDeleteNode}
        onDragHandleStart={
          isDraggable && sortableListKey
            ? () => setDragState({ listKey: sortableListKey, nodeId: node.id, overId: null })
            : undefined
        }
        onDragHandleEnd={() => setDragState({ listKey: null, nodeId: null, overId: null })}
        onDragEnter={
          isDraggable && onDropOn
            ? () => setDragState((s) => ({ ...s, overId: node.id }))
            : undefined
        }
        onDragLeave={
          isDraggable
            ? () => setDragState((s) => (s.overId === node.id ? { ...s, overId: null } : s))
            : undefined
        }
        onDrop={
          isDraggable && onDropOn
            ? (e) => {
                e.preventDefault();
                onDropOn(node.id);
              }
            : undefined
        }
        onDragOver={
          isDraggable && onDropOn
            ? (e) => {
                e.preventDefault();
              }
            : undefined
        }
      />
      {hasChildren && isOpen ? (
        <SortableSiblingList
          listKey={node.childrenListKey}
          nodes={node.children!}
          depth={depth + 1}
          expanded={expanded}
          selectedNodeId={selectedNodeId}
          hiddenNodes={hiddenNodes}
          visibilityValues={visibilityValues}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          onToggleHidden={onToggleHidden}
          onDeleteNode={onDeleteNode}
          onReorder={onReorder}
          dragState={dragState}
          setDragState={setDragState}
        />
      ) : null}
    </>
  );
}

function SidebarRow({
  node,
  indent,
  hasChildren,
  isOpen,
  isSelected,
  isHidden,
  isDraggable,
  isDragOver,
  isDragging,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDeleteNode,
  onDragHandleStart,
  onDragHandleEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragOver,
}: {
  node: SidebarNode;
  indent: number;
  hasChildren: boolean;
  isOpen: boolean;
  isSelected: boolean;
  isHidden: boolean;
  isDraggable: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  onToggleExpand: (id: string) => void;
  onSelect: (node: SidebarNode) => void;
  onToggleHidden: (id: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDragHandleStart?: () => void;
  onDragHandleEnd?: () => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      data-sidebar-node-id={node.id}
      className={`group flex items-center gap-0.5 pr-1 text-[13px] transition-colors duration-150 ${
        isSelected
          ? 'bg-[#005bd3] font-medium text-white'
          : 'text-gray-800 hover:bg-[#ededed]'
      } ${isHidden ? 'opacity-50' : ''} ${isDragOver && !isSelected ? 'bg-[#dfe7f7]' : ''} ${isDragging ? 'opacity-40' : ''}`}
      style={{ paddingLeft: indent - 4 }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {isDraggable ? (
        <span
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragHandleStart?.();
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', node.id);
          }}
          onDragEnd={() => onDragHandleEnd?.()}
          className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <DragHandleIcon className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="w-5 shrink-0" />
      )}
      {hasChildren ? (
        <button
          type="button"
          onClick={() => onToggleExpand(node.id)}
          className={`flex h-7 w-5 shrink-0 items-center justify-center ${
            isSelected ? 'text-white/90 hover:text-white' : 'text-gray-500 hover:text-gray-800'
          }`}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <span className="w-5 shrink-0" />
      )}
      <button
        type="button"
        className="flex min-h-[32px] min-w-0 flex-1 items-center gap-2 py-1 pr-1 text-left"
        onClick={() => {
          onSelect(node);
          if (hasChildren && !node.fields?.length) onToggleExpand(node.id);
        }}
      >
        <SidebarRowIcon
          icon={node.icon ?? (node.kind === 'section' ? 'section' : 'default')}
          muted={isSelected}
        />
        <span className="shrink-0 text-[13px] font-medium">{node.label}</span>
        {node.preview ? (
          <span
            className={`min-w-0 flex-1 truncate text-xs font-normal italic ${
              isSelected ? 'text-white/75' : 'text-gray-500'
            }`}
          >
            – {node.preview}
          </span>
        ) : null}
      </button>
      {node.showDeleteButton && onDeleteNode ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(node.id);
          }}
          className={`mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 ${
            isSelected
              ? 'text-white/90 opacity-100 hover:bg-white/20 hover:text-white'
              : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
          }`}
          title={node.kind === 'block' ? 'Remove block' : 'Remove section'}
          aria-label={`Remove ${node.label}`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      ) : null}
      {node.showVisibilityToggle ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleHidden(node.id);
          }}
          className={`mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded opacity-0 group-hover:opacity-100 ${
            isSelected
              ? 'text-white/90 opacity-100 hover:bg-white/20'
              : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-800'
          }`}
          title={isHidden ? 'Show' : 'Hide'}
        >
          {isHidden ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}

export type CreateThemeEditorSidebarProps = {
  pageLabel: string;
  sidebarTab: ThemeEditorSidebarTab;
  onSidebarTabChange: (tab: ThemeEditorSidebarTab) => void;
  onExit: () => void;
  tree: SidebarNode[];
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  selectedNodeId: string;
  onSelectNode: (node: SidebarNode) => void;
  hiddenNodes: Record<string, boolean>;
  visibilityValues?: Record<string, string | boolean>;
  onToggleHidden: (id: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onReorder: (listKey: string, orderedIds: string[]) => void;
  onInsertSection?: (ctx: SectionInsertContext) => void;
  onInsertHoverChange?: (ctx: SectionInsertContext | null) => void;
  loading?: boolean;
  error?: string | null;
  settingsNode?: SidebarNode | null;
  settingsValues?: Record<string, string | boolean>;
  onSettingsFieldChange?: (
    path: string,
    type: ThemeEditorFieldType,
    value: string | boolean
  ) => void;
  onCollectionLinksApply?: (settingsPath: string, collections: Collection[]) => void;
  onStoreMenuSelect?: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
  onCloseSettings?: () => void;
  onRemoveSettingsSection?: () => void;
  onRemoveSettingsBlock?: () => void;
};

const CreateThemeEditorSidebarInner: React.FC<CreateThemeEditorSidebarProps> = ({
  pageLabel,
  sidebarTab,
  onSidebarTabChange,
  onExit,
  tree,
  expanded,
  onToggleExpand,
  selectedNodeId,
  onSelectNode,
  hiddenNodes,
  visibilityValues,
  onToggleHidden,
  onDeleteNode,
  onReorder,
  onInsertSection,
  onInsertHoverChange,
  loading,
  error,
  settingsNode,
  settingsValues = {},
  onSettingsFieldChange,
  onCollectionLinksApply,
  onStoreMenuSelect,
  onCloseSettings,
  onRemoveSettingsSection,
  onRemoveSettingsBlock,
}) => {
  const [dragState, setDragState] = useState<DragState>({
    listKey: null,
    nodeId: null,
    overId: null,
  });

  const title = sidebarTab === 'sections' ? pageLabel : 'Theme settings';
  const showSettingsPanel = Boolean(settingsNode && onSettingsFieldChange && onCloseSettings);

  useEffect(() => {
    if (!selectedNodeId) return;
    const el = document.querySelector(`[data-sidebar-node-id="${CSS.escape(selectedNodeId)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedNodeId, tree]);

  return (
    <aside className="relative flex h-full min-h-0 w-[300px] shrink-0 flex-col border-r border-[#e1e1e1] bg-[#f6f6f7]">
      <div className="flex items-center gap-0.5 border-b border-[#e1e1e1] bg-[#f6f6f7] px-2 py-2">
        <button
          type="button"
          onClick={onExit}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9cccf] bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          title="Exit editor"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onSidebarTabChange('sections')}
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            sidebarTab === 'sections'
              ? 'bg-[#d4e3ff] text-[#005bd3]'
              : 'text-gray-600 hover:bg-[#ededed]'
          }`}
          title="Sections"
        >
          <Squares2X2Icon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onSidebarTabChange('theme-settings')}
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            sidebarTab === 'theme-settings'
              ? 'bg-[#d4e3ff] text-[#005bd3]'
              : 'text-gray-600 hover:bg-[#ededed]'
          }`}
          title="Theme settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      <h2 className="border-b border-[#e1e1e1] bg-[#f6f6f7] px-3 py-3 text-[13px] font-medium text-gray-500">
        {sidebarTab === 'sections' ? (
          <>
            Editing: <span className="font-semibold text-gray-900">{pageLabel}</span>
          </>
        ) : (
          title
        )}
      </h2>

      <div className="create-theme-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {loading ? <p className="p-4 text-sm text-gray-500">Loading theme…</p> : null}
        {error ? <p className="p-4 text-sm text-red-600">{error}</p> : null}
        {!loading && sidebarTab === 'theme-settings' ? <ThemeSettingsNav /> : null}
        {!loading && sidebarTab === 'sections' && tree.length > 0 ? (
          <div className="pb-3 pt-1">
            {tree.map((node) =>
              node.kind === 'group-label' ? (
                <SidebarGroup
                  key={node.id}
                  label={node.label}
                  nodes={node.children ?? []}
                  depth={0}
                  expanded={expanded}
                  selectedNodeId={selectedNodeId}
                  hiddenNodes={hiddenNodes}
                  visibilityValues={visibilityValues}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelectNode}
                  onToggleHidden={onToggleHidden}
                  onDeleteNode={onDeleteNode}
                  onReorder={onReorder}
                  onInsertSection={onInsertSection}
                  onInsertHoverChange={onInsertHoverChange}
                  dragState={dragState}
                  setDragState={setDragState}
                  childrenListKey={node.childrenListKey}
                />
              ) : (
                <SidebarTreeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  selectedNodeId={selectedNodeId}
                  hiddenNodes={hiddenNodes}
                  visibilityValues={visibilityValues}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelectNode}
                  onToggleHidden={onToggleHidden}
                  onDeleteNode={onDeleteNode}
                  onReorder={onReorder}
                  onInsertHoverChange={onInsertHoverChange}
                  dragState={dragState}
                  setDragState={setDragState}
                />
              )
            )}
          </div>
        ) : null}
      </div>

      {sidebarTab === 'sections' && showSettingsPanel && settingsNode ? (
        <ThemeEditorSettingsSheet>
          <ThemeSectionSettingsPanel
            node={settingsNode}
            values={settingsValues}
            onFieldChange={onSettingsFieldChange!}
            onCollectionLinksApply={onCollectionLinksApply}
            onStoreMenuSelect={onStoreMenuSelect}
            onClose={onCloseSettings!}
            onRemoveSection={onRemoveSettingsSection}
            onRemoveBlock={onRemoveSettingsBlock}
          />
        </ThemeEditorSettingsSheet>
      ) : null}
    </aside>
  );
};

export const CreateThemeEditorSidebar = memo(CreateThemeEditorSidebarInner);
export default CreateThemeEditorSidebar;