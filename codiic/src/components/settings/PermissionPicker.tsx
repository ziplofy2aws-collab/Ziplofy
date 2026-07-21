import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { PermissionDefinition } from '../../contexts/permissions.context';
import {
  buildPermissionTree,
  collectExpandableKeys,
  collectLeafKeys,
  filterPermissionTree,
  getDescendantLeafKeys,
  type PermissionTreeNode,
} from '../../utils/permission-tree.util';

interface PermissionPickerProps {
  permissions: PermissionDefinition[];
  loading: boolean;
  error: string | null;
  selectedLeafKeys: Set<string>;
  onChange: (keys: Set<string>) => void;
  onRetry?: () => void;
}

const PermissionPicker: React.FC<PermissionPickerProps> = ({
  permissions,
  loading,
  error,
  selectedLeafKeys,
  onChange,
  onRetry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildPermissionTree(permissions), [permissions]);
  const allLeafKeys = useMemo(() => collectLeafKeys(tree), [tree]);
  const expandableKeys = useMemo(() => collectExpandableKeys(tree), [tree]);
  const filteredTree = useMemo(() => filterPermissionTree(tree, searchTerm), [tree, searchTerm]);

  const getLeafCounts = (node: PermissionTreeNode) => {
    const leaves = getDescendantLeafKeys(node);
    const selected = leaves.filter((key) => selectedLeafKeys.has(key));
    return {
      total: leaves.length,
      selected: selected.length,
      checked: selected.length === leaves.length && leaves.length > 0,
      indeterminate: selected.length > 0 && selected.length < leaves.length,
    };
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleNodeSelection = (node: PermissionTreeNode) => {
    const leafKeys = getDescendantLeafKeys(node);
    const allSelected = leafKeys.every((key) => selectedLeafKeys.has(key));
    const next = new Set(selectedLeafKeys);
    if (allSelected) {
      leafKeys.forEach((key) => next.delete(key));
    } else {
      leafKeys.forEach((key) => next.add(key));
    }
    onChange(next);
  };

  const handleSelectAll = () => {
    if (selectedLeafKeys.size === allLeafKeys.length) {
      onChange(new Set());
    } else {
      onChange(new Set(allLeafKeys));
    }
  };

  const handleExpandAll = () => {
    const allExpanded = expandableKeys.every((key) => expandedKeys.has(key));
    setExpandedKeys(allExpanded ? new Set() : new Set(expandableKeys));
  };

  const renderNode = (node: PermissionTreeNode, depth = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const state = getLeafCounts(node);
    const expanded = expandedKeys.has(node.key) || !hasChildren;
    const indent = depth * 1.5;

    return (
      <div key={node.key}>
        <div
          className="flex items-center py-2 rounded-lg hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${indent}rem` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.key)}
              className="p-1 text-gray-500 hover:text-gray-700 mr-1 rounded-md hover:bg-white transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-1" />
          )}
          <input
            type="checkbox"
            ref={(input) => {
              if (input) {
                input.indeterminate = !state.checked && state.indeterminate;
              }
            }}
            checked={state.checked}
            onChange={() => toggleNodeSelection(node)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 mr-2"
          />
          <span className="text-sm text-gray-900">{node.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-500 ml-auto mr-2">
              {state.selected}/{state.total}
            </span>
          )}
        </div>
        {hasChildren && (
          <div className={expanded ? 'block' : 'hidden'}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm">Loading permissions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-700">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-800 hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-center">
        <p className="text-sm font-medium text-amber-900">No permissions found</p>
        <p className="mt-1 text-sm text-amber-800">
          Permission definitions need to be seeded in the database.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-200"
          >
            Reload permissions
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search permissions"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            ref={(input) => {
              if (input) {
                input.indeterminate =
                  selectedLeafKeys.size > 0 && selectedLeafKeys.size < allLeafKeys.length;
              }
            }}
            checked={selectedLeafKeys.size === allLeafKeys.length && allLeafKeys.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30"
            aria-label="Select all permissions"
          />
          <span className="text-sm font-medium text-gray-900">Select all permissions</span>
        </div>
        <button
          type="button"
          onClick={handleExpandAll}
          className="text-sm font-medium text-gray-700 hover:underline"
        >
          {expandableKeys.length > 0 && expandableKeys.every((key) => expandedKeys.has(key))
            ? 'Collapse all'
            : 'Expand all'}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 max-h-[520px] overflow-auto">
        {filteredTree.map((node) => renderNode(node))}
        {filteredTree.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No permissions match your search.</p>
        )}
      </div>
    </div>
  );
};

export default PermissionPicker;
