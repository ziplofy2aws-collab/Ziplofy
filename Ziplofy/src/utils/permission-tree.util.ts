import type { PermissionDefinition } from '../contexts/permissions.context';

export interface PermissionTreeNode {
  key: string;
  name: string;
  isLeaf: boolean;
  parentKey?: string | null;
  order?: number;
  resource?: string;
  children: PermissionTreeNode[];
}

export function buildPermissionTree(permissions: PermissionDefinition[]): PermissionTreeNode[] {
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
}

export function collectLeafKeys(tree: PermissionTreeNode[]): string[] {
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
}

export function getDescendantLeafKeys(node: PermissionTreeNode): string[] {
  if (node.isLeaf || node.children.length === 0) {
    return [node.key];
  }
  return node.children.flatMap(getDescendantLeafKeys);
}

export function filterPermissionTree(
  tree: PermissionTreeNode[],
  searchTerm: string
): PermissionTreeNode[] {
  if (!searchTerm.trim()) return tree;
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
  return tree.map(filterNode).filter((node): node is PermissionTreeNode => Boolean(node));
}

export function collectExpandableKeys(tree: PermissionTreeNode[]): string[] {
  const keys: string[] = [];
  const collect = (node: PermissionTreeNode) => {
    if (node.children.length > 0) {
      keys.push(node.key);
      node.children.forEach(collect);
    }
  };
  tree.forEach(collect);
  return keys;
}
