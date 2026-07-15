import React, { Fragment, memo, useCallback, useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  MegaphoneIcon,
  PhotoIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  TagIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
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

function CheckoutBlockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="2" y="7" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
    </svg>
  );
}

function CheckoutFieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
    case 'contact':
      return <UserIcon className={cls} />;
    case 'delivery':
      return <TruckIcon className={cls} />;
    case 'payment':
      return <CreditCardIcon className={cls} />;
    case 'cart':
      return <ShoppingCartIcon className={cls} />;
    case 'receipt':
      return (
        <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M4 2.5h8v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1L4 13.5V2.5z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M6 5.5h4M6 7.5h4M6 9.5h2.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'checkout-block':
      return <CheckoutBlockIcon className={cls} />;
    case 'checkout-field':
      return <CheckoutFieldIcon className={cls} />;
    case 'confirmation':
      return <CheckCircleIcon className={cls} />;
    case 'order-status':
      return <ClockIcon className={cls} />;
    case 'announcement':
      return <MegaphoneIcon className={cls} />;
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
  /** Insert relative to `overId` — guides the blue drop line. */
  edge: 'before' | 'after' | null;
};

const EMPTY_DRAG_STATE: DragState = {
  listKey: null,
  nodeId: null,
  overId: null,
  edge: null,
};

/** Blue “drop here” rule between sortable rows while dragging. */
function ReorderDropIndicator({ paddingLeft }: { paddingLeft: number }) {
  return (
    <div
      className="pointer-events-none relative z-[2] -my-0.5 flex h-3 w-full items-center"
      style={{ paddingLeft, paddingRight: 12 }}
      aria-hidden
    >
      <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <div
          className="h-[3px] flex-1 rounded-full shadow-[0_0_0_2px_rgba(0,91,211,0.12)]"
          style={{ backgroundColor: SHOPIFY_BLUE }}
        />
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
          style={{ backgroundColor: SHOPIFY_BLUE }}
        >
          Drop
        </span>
        <div
          className="h-[3px] flex-1 rounded-full shadow-[0_0_0_2px_rgba(0,91,211,0.12)]"
          style={{ backgroundColor: SHOPIFY_BLUE }}
        />
      </div>
    </div>
  );
}

function isCheckoutDisabledRow(node: SidebarNode): boolean {
  return Boolean(
    node.disabled &&
      (node.checkoutStatic ||
        node.checkoutMainCategory ||
        node.checkoutCategory ||
        node.icon === 'checkout-field' ||
        node.icon === 'checkout-block')
  );
}

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
  checkoutMainGroup,
  groupNode,
}: Omit<TreeRowProps, 'node'> & {
  label: string;
  nodes: SidebarNode[];
  childrenListKey?: string;
  checkoutMainGroup?: boolean;
  groupNode?: SidebarNode;
}) {
  const insertGroup = sectionInsertGroupForLabel(label);
  const isMainGroupSelected = Boolean(groupNode && selectedNodeId === groupNode.id);
  const labelPaddingLeft = SIDEBAR_BASE_PADDING + depth * SIDEBAR_DEPTH_STEP;
  const mainGroupLabelClassName = checkoutMainGroup
    ? 'px-3 pb-1 pt-3 text-[13px] font-semibold text-gray-900'
    : 'px-3 pb-1.5 pt-4 text-[15px] font-semibold text-gray-900';

  return (
    <>
      {checkoutMainGroup && groupNode?.checkoutMainGroupSelectable ? (
        <button
          type="button"
          onClick={() => onSelect(groupNode)}
          className={`block w-full text-left transition-colors duration-150 ${
            isMainGroupSelected
              ? 'bg-[#005bd3] text-white'
              : 'text-gray-900 hover:bg-[#ededed]'
          } ${mainGroupLabelClassName}`}
          style={{ paddingLeft: labelPaddingLeft }}
        >
          {label}
        </button>
      ) : (
        <p className={mainGroupLabelClassName} style={{ paddingLeft: labelPaddingLeft }}>
          {label}
        </p>
      )}
      <SortableSiblingList
        listKey={childrenListKey}
        nodes={nodes}
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
    (targetId: string, edge: 'before' | 'after' = 'before') => {
      if (!listKey || !dragState.nodeId || !edge) return;
      if (dragState.nodeId === targetId) return;
      const targetIndex = sortableIds.indexOf(targetId);
      if (sortableIds.indexOf(dragState.nodeId) < 0 || targetIndex < 0) return;

      const without = sortableIds.filter((id) => id !== dragState.nodeId);
      const toInWithout = without.indexOf(targetId);
      if (toInWithout < 0) return;
      const insertAt = edge === 'before' ? toInWithout : toInWithout + 1;
      const next = [...without];
      next.splice(insertAt, 0, dragState.nodeId);
      // No-op if order unchanged
      if (next.every((id, i) => id === sortableIds[i])) {
        setDragState(EMPTY_DRAG_STATE);
        return;
      }
      onReorder(listKey, next);
      setDragState(EMPTY_DRAG_STATE);
    },
    [dragState.nodeId, listKey, onReorder, setDragState, sortableIds]
  );

  const insertPadding = sidebarContentPadding(depth);
  const isListDragActive = Boolean(
    listKey && dragState.listKey === listKey && dragState.nodeId
  );

  return (
    <>
      {nodes.map((child, index) => {
        const prev = index > 0 ? nodes[index - 1] : null;
        const showInsert =
          sectionInsertGroup &&
          sectionInsertLabel &&
          onInsertSection &&
          prev &&
          allowsSectionInsertGap(prev, child) &&
          !isListDragActive;

        const showDropBefore =
          isListDragActive &&
          isSortableSidebarNode(child) &&
          dragState.overId === child.id &&
          dragState.edge === 'before' &&
          dragState.nodeId !== child.id;

        const showDropAfter =
          isListDragActive &&
          isSortableSidebarNode(child) &&
          dragState.overId === child.id &&
          dragState.edge === 'after' &&
          dragState.nodeId !== child.id;

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
            {showDropBefore ? <ReorderDropIndicator paddingLeft={insertPadding} /> : null}
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
            {showDropAfter ? <ReorderDropIndicator paddingLeft={insertPadding} /> : null}
          </Fragment>
        );
      })}
    </>
  );
}

function CheckoutDisabledTreeRow({
  node,
  depth,
  indent,
  expanded,
  selectedNodeId,
  hiddenNodes,
  visibilityValues,
  onToggleExpand,
  onSelect,
  onToggleHidden,
  onDeleteNode,
  onReorder,
  dragState,
  setDragState,
}: {
  node: SidebarNode;
  depth: number;
  indent: number;
} & Omit<TreeRowProps, 'node' | 'onInsertSection' | 'onInsertHoverChange' | 'dragState' | 'setDragState'> & {
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isStatic = node.checkoutStatic === true;
  const isOpen = isStatic || expanded[node.id] === true;
  const showChevron = hasChildren && !isStatic;
  const icon =
    node.icon ??
    (node.checkoutMainCategory || node.checkoutCategory
      ? 'default'
      : node.kind === 'section'
        ? 'section'
        : 'checkout-field');

  return (
    <>
      <div
        className="flex items-center gap-0.5 pr-1 text-[13px] text-gray-800"
        style={{ paddingLeft: indent - 4 }}
      >
        <span className="w-5 shrink-0" />
        {showChevron ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="flex h-7 w-5 shrink-0 items-center justify-center text-gray-500 hover:text-gray-800"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <ChevronDownIcon className="h-3.5 w-3.5" />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <div className="flex min-h-[32px] min-w-0 flex-1 items-center gap-2 py-1 pr-1">
          <SidebarRowIcon icon={icon} muted={false} />
          <span className="shrink-0 text-[13px] font-medium">{node.label}</span>
        </div>
      </div>
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
  onDropOn?: (targetId: string, edge: 'before' | 'after') => void;
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
        checkoutMainGroup={node.checkoutMainGroup}
        groupNode={node}
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
    isDraggable &&
    dragState.overId === node.id &&
    dragState.listKey === sortableListKey &&
    dragState.nodeId !== node.id &&
    Boolean(dragState.edge);

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

  if (node.checkoutSection) {
    return (
      <>
        <CheckoutSidebarSectionRow
          node={node}
          indent={indent}
          hasChildren={hasChildren}
          isOpen={isOpen}
          isSelected={isSelected}
          isHidden={isHidden}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
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
            onInsertSection={onInsertSection}
            onInsertHoverChange={onInsertHoverChange}
            dragState={dragState}
            setDragState={setDragState}
          />
        ) : null}
      </>
    );
  }

  if (node.disabled && isCheckoutDisabledRow(node)) {
    return (
      <CheckoutDisabledTreeRow
        node={node}
        depth={depth}
        indent={indent}
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
    );
  }

  if (node.disabled) {
    return (
      <>
        <div
          className="flex items-center gap-0.5 pr-1 text-[13px] text-gray-600"
          style={{ paddingLeft: indent - 4 }}
        >
          <span className="w-5 shrink-0" />
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="flex h-7 w-5 shrink-0 items-center justify-center text-gray-500 hover:text-gray-800"
              aria-label={isOpen ? 'Collapse' : 'Expand'}
            >
              {isOpen ? (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronRightIcon className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          <div className="flex min-h-[32px] min-w-0 flex-1 items-center gap-2 py-1 pr-1">
            <SidebarRowIcon
              icon={node.icon ?? (node.kind === 'section' ? 'section' : 'default')}
              muted
            />
            <span className="shrink-0 text-[13px] font-medium">{node.label}</span>
          </div>
        </div>
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
            ? () =>
                setDragState({
                  listKey: sortableListKey,
                  nodeId: node.id,
                  overId: null,
                  edge: null,
                })
            : undefined
        }
        onDragHandleEnd={() => setDragState(EMPTY_DRAG_STATE)}
        onDragEnter={
          isDraggable && onDropOn
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
              }
            : undefined
        }
        onDragLeave={
          isDraggable
            ? (e) => {
                const related = e.relatedTarget as Node | null;
                if (related && e.currentTarget.contains(related)) return;
                setDragState((s) =>
                  s.overId === node.id ? { ...s, overId: null, edge: null } : s
                );
              }
            : undefined
        }
        onDrop={
          isDraggable && onDropOn
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                const edge =
                  dragState.overId === node.id && dragState.edge
                    ? dragState.edge
                    : (() => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                      })();
                onDropOn(node.id, edge);
              }
            : undefined
        }
        onDragOver={
          isDraggable && onDropOn
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                const rect = e.currentTarget.getBoundingClientRect();
                const edge: 'before' | 'after' =
                  e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
                setDragState((s) => {
                  if (s.listKey !== sortableListKey || !s.nodeId || s.nodeId === node.id) {
                    return s.overId === null && s.edge === null
                      ? s
                      : { ...s, overId: null, edge: null };
                  }
                  if (s.overId === node.id && s.edge === edge) return s;
                  return { ...s, overId: node.id, edge };
                });
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

function CheckoutSidebarSectionRow({
  node,
  indent,
  hasChildren,
  isOpen,
  isSelected,
  isHidden,
  onToggleExpand,
  onSelect,
}: {
  node: SidebarNode;
  indent: number;
  hasChildren: boolean;
  isOpen: boolean;
  isSelected: boolean;
  isHidden: boolean;
  onToggleExpand: (id: string) => void;
  onSelect: (node: SidebarNode) => void;
}) {
  return (
    <div
      data-sidebar-node-id={node.id}
      className={`group flex items-center gap-0.5 pr-2 text-[13px] transition-colors duration-150 ${
        isSelected
          ? 'bg-[#005bd3] font-medium text-white'
          : 'text-gray-900 hover:bg-[#ededed]'
      } ${isHidden ? 'opacity-50' : ''}`}
      style={{ paddingLeft: indent - 4 }}
    >
      <span className="w-5 shrink-0" />
      <button
        type="button"
        className="flex min-h-[32px] min-w-0 flex-1 items-center py-1 pr-1 text-left"
        onClick={() => onSelect(node)}
      >
        <span className="text-[13px] font-semibold">{node.label}</span>
      </button>
      {hasChildren ? (
        <button
          type="button"
          onClick={() => onToggleExpand(node.id)}
          className={`flex h-7 w-5 shrink-0 items-center justify-center ${
            isSelected ? 'text-white/90 hover:text-white' : 'text-gray-500 hover:text-gray-800'
          }`}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? (
            <ChevronDownIcon className="h-3.5 w-3.5" />
          ) : (
            <ChevronRightIcon className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}
    </div>
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
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      data-sidebar-node-id={node.id}
      className={`group relative flex items-center gap-0.5 pr-1 text-[13px] transition-[background-color,opacity,box-shadow] duration-150 ease-out ${
        isSelected
          ? 'bg-[#005bd3] font-medium text-white'
          : 'text-gray-800 hover:bg-[#ededed]'
      } ${isHidden ? 'opacity-50' : ''} ${
        isDragOver && !isSelected ? 'bg-[#edf3ff] ring-1 ring-inset ring-[#005bd3]/30' : ''
      } ${isDragging ? 'opacity-35 scale-[0.99]' : ''}`}
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
            const row = e.currentTarget.closest('[data-sidebar-node-id]') as HTMLElement | null;
            if (row) {
              const ghost = row.cloneNode(true) as HTMLElement;
              ghost.style.position = 'absolute';
              ghost.style.top = '-9999px';
              ghost.style.left = '-9999px';
              ghost.style.width = `${row.offsetWidth}px`;
              ghost.style.opacity = '0.92';
              ghost.style.pointerEvents = 'none';
              ghost.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
              ghost.style.borderRadius = '8px';
              ghost.style.background = '#fff';
              document.body.appendChild(ghost);
              e.dataTransfer.setDragImage(ghost, 24, 16);
              requestAnimationFrame(() => ghost.remove());
            }
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
        <span
          className={`min-w-0 truncate text-[13px] font-medium ${node.preview ? 'shrink-0' : ''}`}
        >
          {node.label}
        </span>
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
  /** When `plain`, the sidebar heading shows only `pageLabel` (checkout editor style). */
  sidebarTitleMode?: 'editing' | 'plain';
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
  /** Fired when structure drag starts/ends — used to squeeze the live preview canvas. */
  onStructureDragChange?: (active: boolean) => void;
  onInsertSection?: (ctx: SectionInsertContext) => void;
  onInsertHoverChange?: (ctx: SectionInsertContext | null) => void;
  loading?: boolean;
  error?: string | null;
  settingsNode?: SidebarNode | null;
  checkoutSettingsPanel?: React.ReactNode;
  checkoutThemeSettingsNav?: React.ReactNode;
  themeSettingsNav?: React.ReactNode;
  settingsValues?: Record<string, string | boolean>;
  themeConfig?: Record<string, unknown> | null;
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
  themeColorPalette?: string[];
  sectionsHeaderSlot?: React.ReactNode;
};

const CreateThemeEditorSidebarInner: React.FC<CreateThemeEditorSidebarProps> = ({
  pageLabel,
  sidebarTitleMode = 'editing',
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
  onStructureDragChange,
  onInsertSection,
  onInsertHoverChange,
  loading,
  error,
  settingsNode,
  checkoutSettingsPanel,
  checkoutThemeSettingsNav,
  themeSettingsNav,
  settingsValues = {},
  themeConfig = null,
  onSettingsFieldChange,
  onCollectionLinksApply,
  onStoreMenuSelect,
  onCloseSettings,
  onRemoveSettingsSection,
  onRemoveSettingsBlock,
  themeColorPalette,
  sectionsHeaderSlot,
}) => {
  const [dragState, setDragState] = useState<DragState>(EMPTY_DRAG_STATE);

  const setDragStateAndNotify = useCallback(
    (next: React.SetStateAction<DragState>) => {
      setDragState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        const wasActive = Boolean(prev.nodeId);
        const isActive = Boolean(resolved.nodeId);
        if (wasActive !== isActive) onStructureDragChange?.(isActive);
        return resolved;
      });
    },
    [onStructureDragChange]
  );

  const title =
    sidebarTab === 'sections'
      ? pageLabel
      : sidebarTitleMode === 'plain'
        ? 'Settings'
        : 'Theme settings';
  const showThemeSettingsPanel = Boolean(settingsNode && onSettingsFieldChange && onCloseSettings);
  const showCheckoutSettingsPanel = Boolean(checkoutSettingsPanel && onCloseSettings);

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
          sidebarTitleMode === 'plain' ? (
            <span className="font-semibold text-gray-900">{pageLabel}</span>
          ) : (
            <>
              Editing: <span className="font-semibold text-gray-900">{pageLabel}</span>
            </>
          )
        ) : sidebarTitleMode === 'plain' ? (
          <span className="font-semibold text-gray-900">{title}</span>
        ) : (
          title
        )}
      </h2>

      {sidebarTab === 'sections' && sectionsHeaderSlot ? sectionsHeaderSlot : null}

      <div className="create-theme-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {loading ? <p className="p-4 text-sm text-gray-500">Loading theme…</p> : null}
        {error ? <p className="p-4 text-sm text-red-600">{error}</p> : null}
        {!loading && sidebarTab === 'theme-settings' ? (
          checkoutThemeSettingsNav ?? themeSettingsNav ?? (
            <ThemeSettingsNav
              values={{}}
              colorPalette={[]}
              onFieldChange={() => {}}
              onPaletteChange={() => {}}
            />
          )
        ) : null}
        {!loading && sidebarTab === 'sections' && tree.length > 0 ? (
          <div className="pb-3 pt-1">
            {tree.map((node, index) => (
              <Fragment key={node.id}>
                {sidebarTitleMode === 'plain' && index > 0 ? (
                  <div
                    className="mx-3 border-t border-[#e1e3e5]"
                    role="presentation"
                    aria-hidden
                  />
                ) : null}
                {node.kind === 'group-label' ? (
                  <SidebarGroup
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
                    setDragState={setDragStateAndNotify}
                    childrenListKey={node.childrenListKey}
                    checkoutMainGroup={node.checkoutMainGroup}
                    groupNode={node}
                  />
                ) : (
                  <SidebarTreeRow
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
                    setDragState={setDragStateAndNotify}
                  />
                )}
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>

      {sidebarTab === 'sections' && showThemeSettingsPanel && settingsNode ? (
        <ThemeEditorSettingsSheet>
          <ThemeSectionSettingsPanel
            node={settingsNode}
            values={settingsValues}
            themeConfig={themeConfig}
            colorPalette={themeColorPalette}
            onFieldChange={onSettingsFieldChange!}
            onCollectionLinksApply={onCollectionLinksApply}
            onStoreMenuSelect={onStoreMenuSelect}
            onClose={onCloseSettings!}
            onRemoveSection={onRemoveSettingsSection}
            onRemoveBlock={onRemoveSettingsBlock}
          />
        </ThemeEditorSettingsSheet>
      ) : null}
      {sidebarTab === 'sections' && showCheckoutSettingsPanel ? (
        <ThemeEditorSettingsSheet>{checkoutSettingsPanel}</ThemeEditorSettingsSheet>
      ) : null}
    </aside>
  );
};

export const CreateThemeEditorSidebar = memo(CreateThemeEditorSidebarInner);
export default CreateThemeEditorSidebar;