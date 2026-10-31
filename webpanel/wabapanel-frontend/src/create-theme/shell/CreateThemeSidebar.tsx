import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { CreateThemeSidebarNode } from '../types';

type Props = {
  nodes: CreateThemeSidebarNode[];
  selectedId: string;
  expanded: Record<string, boolean>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddSection: (groupId: 'header' | 'template' | 'footer') => void;
  onDelete?: (node: CreateThemeSidebarNode) => void;
};

function groupFromAddId(id: string): 'header' | 'template' | 'footer' | null {
  if (id === 'add-section:header') return 'header';
  if (id === 'add-section:template') return 'template';
  if (id === 'add-section:footer') return 'footer';
  return null;
}

function Row({
  node,
  depth,
  selectedId,
  expanded,
  onSelect,
  onToggleExpand,
  onAddSection,
  onDelete,
}: {
  node: CreateThemeSidebarNode;
  depth: number;
  selectedId: string;
  expanded: Record<string, boolean>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddSection: (group: 'header' | 'template' | 'footer') => void;
  onDelete?: (node: CreateThemeSidebarNode) => void;
}) {
  const isAdd = node.kind === 'add';
  const addGroup = isAdd ? groupFromAddId(node.id) : null;
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded[node.id] !== false;
  const selected = selectedId === node.id;

  if (isAdd && addGroup) {
    return (
      <button
        type="button"
        onClick={() => onAddSection(addGroup)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-[#005bd3] hover:bg-blue-50"
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <PlusIcon className="h-4 w-4 shrink-0" />
        {node.label}
      </button>
    );
  }

  return (
    <>
      <div
        className={`flex items-center gap-1 rounded-md pr-1 ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-100"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            <span className="inline-block w-3 text-[10px]">{isOpen ? '▼' : '▶'}</span>
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="min-w-0 flex-1 py-1.5 text-left text-sm text-gray-900"
        >
          {node.label}
        </button>
        {node.deletable && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(node)}
            className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${node.label}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {hasChildren && isOpen
        ? node.children!.map((child) => (
            <Row
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddSection={onAddSection}
              onDelete={onDelete}
            />
          ))
        : null}
    </>
  );
}

export function CreateThemeSidebar(props: Props) {
  return (
    <nav className="flex flex-col gap-0.5 py-2" aria-label="Theme structure">
      {props.nodes.map((node) => (
        <Row key={node.id} node={node} depth={0} {...props} />
      ))}
    </nav>
  );
}
