import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../contexts/permissions.context';
import { useStoreRoles } from '../../contexts/store-roles.context';
import { useStore } from '../../contexts/store.context';
import toast from 'react-hot-toast';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

interface PermissionTreeNode {
  key: string;
  name: string;
  isLeaf: boolean;
  parentKey?: string | null;
  order?: number;
  resource?: string;
  children: PermissionTreeNode[];
}

const RoleDetailsPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { permissions, loading, error, fetchAll } = usePermissions();
  const { roles, fetchByStoreId, update } = useStoreRoles();
  const { activeStoreId } = useStore();

  const role = useMemo(() => roles.find((r) => r._id === roleId), [roles, roleId]);

  useEffect(() => {
    if (permissions.length === 0 && !loading) {
      fetchAll().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!role && activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId, role]);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [selectedLeafKeys, setSelectedLeafKeys] = useState<Set<string>>(new Set());
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!role) return;
    setRoleName(role.name || '');
    setRoleDescription(role.description || '');
    setSelectedLeafKeys(new Set(role.permissions || []));
  }, [role]);

  const tree = useMemo<PermissionTreeNode[]>(() => {
    const nodes = new Map<string, PermissionTreeNode>();
    permissions.forEach((p) => {
      nodes.set(p.key, {
        key: p.key,
        name: p.name,
        isLeaf: p.isLeaf ?? true,
        parentKey: p.parentKey ?? null,
        order: p.order,
        resource: p.resource,
        children: [],
      });
    });
    const roots: PermissionTreeNode[] = [];
    nodes.forEach((node) => {
      if (node.parentKey && nodes.has(node.parentKey)) {
        nodes.get(node.parentKey)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortChildren = (arr: PermissionTreeNode[]) => {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
      arr.forEach((child) => sortChildren(child.children));
    };
    sortChildren(roots);
    return roots;
  }, [permissions]);

  const allLeafKeys = useMemo(() => {
    const keys: string[] = [];
    const collect = (node: PermissionTreeNode) => {
      if (node.isLeaf || node.children.length === 0) {
        keys.push(node.key);
      } else {
        node.children.forEach(collect);
      }
    };
    tree.forEach(collect);
    return keys;
  }, [tree]);

  useEffect(() => {
    if (!allLeafKeys.length) return;
    const validSet = new Set(allLeafKeys);
    setSelectedLeafKeys((prev) => {
      const next = new Set<string>();
      prev.forEach((key) => {
        if (validSet.has(key)) {
          next.add(key);
        }
      });
      return next;
    });
  }, [allLeafKeys]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getDescendantLeafKeys = (node: PermissionTreeNode): string[] => {
    if (node.isLeaf || node.children.length === 0) {
      return [node.key];
    }
    return node.children.flatMap(getDescendantLeafKeys);
  };

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

  const toggleNodeSelection = (node: PermissionTreeNode) => {
    const leafKeys = getDescendantLeafKeys(node);
    setSelectedLeafKeys((prev) => {
      const next = new Set(prev);
      const allSelected = leafKeys.every((key) => next.has(key));
      if (allSelected) {
        leafKeys.forEach((key) => next.delete(key));
      } else {
        leafKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    const treeRoots = tree;
    if (!searchTerm.trim()) return treeRoots;
    const term = searchTerm.toLowerCase();
    const filterNode = (node: PermissionTreeNode): PermissionTreeNode | null => {
      const matches = node.name.toLowerCase().includes(term) || node.key.toLowerCase().includes(term);
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is PermissionTreeNode => Boolean(child));
      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };
    return treeRoots
      .map(filterNode)
      .filter((node): node is PermissionTreeNode => Boolean(node));
  }, [tree, searchTerm]);

  const expandableKeys = useMemo(() => {
    const keys: string[] = [];
    const collect = (node: PermissionTreeNode) => {
      if (node.children.length > 0) {
        keys.push(node.key);
        node.children.forEach(collect);
      }
    };
    tree.forEach(collect);
    return keys;
  }, [tree]);

  const handleSelectAll = useCallback(() => {
    if (selectedLeafKeys.size === allLeafKeys.length) {
      setSelectedLeafKeys(new Set());
    } else {
      setSelectedLeafKeys(new Set(allLeafKeys));
    }
  }, [allLeafKeys, selectedLeafKeys.size]);

  const handleExpandAll = useCallback(() => {
    const allExpanded = expandableKeys.every((key) => expandedKeys.has(key));
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(expandableKeys));
    }
  }, [expandableKeys, expandedKeys]);

  const selectedLeafArray = useMemo(() => Array.from(selectedLeafKeys).sort(), [selectedLeafKeys]);
  const originalLeafArray = useMemo(
    () => (role ? [...(role.permissions || [])].sort() : []),
    [role]
  );

  const isDirty = useMemo(() => {
    if (!role) return false;
    const nameChanged = roleName.trim() !== (role.name || '');
    const descriptionChanged = roleDescription.trim() !== (role.description || '');
    const permissionsChanged =
      selectedLeafArray.length !== originalLeafArray.length ||
      selectedLeafArray.some((key, index) => key !== originalLeafArray[index]);
    return nameChanged || descriptionChanged || permissionsChanged;
  }, [role, roleName, roleDescription, originalLeafArray, selectedLeafArray]);

  const handleSave = useCallback(async () => {
    if (!role || !roleId) return;
    const trimmedName = roleName.trim();
    const trimmedDescription = roleDescription.trim();
    if (!trimmedName) {
      toast.dismiss();
      toast.error('Role name is required');
      return;
    }
    if (selectedLeafKeys.size === 0) {
      toast.dismiss();
      toast.error('Select at least one permission');
      return;
    }
    try {
      setSaving(true);
      toast.dismiss();
      await update(roleId, {
        name: trimmedName,
        description: trimmedDescription,
        permissions: Array.from(selectedLeafKeys),
      });
      toast.dismiss();
      toast.success('Role updated');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update role';
      toast.dismiss();
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [role, roleId, roleName, roleDescription, selectedLeafKeys, update]);

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

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title={roleName || 'Role'}
          description="Edit name, description, and permissions for this role."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/users/roles')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors"
              aria-label="Back to roles"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/settings/users/roles')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200/90 shadow-sm hover:bg-gray-50/90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isDirty || selectedLeafKeys.size === 0 || !role || saving}
                onClick={handleSave}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          }
        />

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900">Role details</h2>
          <p className="mt-1 text-sm text-gray-500">
            This name will appear when assigning roles to staff.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Support agent"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="What can this role do?"
                rows={2}
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Permissions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose what this role can view and manage.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Selected <span className="font-medium text-gray-900">{selectedLeafKeys.size}</span>
              {allLeafKeys.length > 0 ? (
                <>
                  {' '}
                  of <span className="font-medium text-gray-900">{allLeafKeys.length}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm">Loading permissions…</span>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && (
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
                    {expandableKeys.length > 0 &&
                    expandableKeys.every((key) => expandedKeys.has(key))
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

                {tree.length === 0 && (
                  <p className="text-sm text-gray-500">No permissions found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsPage;
