import type { User } from '@/types/auth';

export type TreeNode = User & {
  children: TreeNode[];
  depth: number;
  /** Total direct + indirect reports. */
  descendantCount: number;
  /** Resolved displayName of `parentId`, when that user exists in this dataset. */
  parentName: string | null;
  /**
   * `parentId` is set but no user with that id was found in the dataset —
   * the node silently becomes a root, which is exactly the kind of
   * "misplaced" seller admins can't otherwise spot in the tree view.
   */
  parentMissing: boolean;
};

/**
 * Build a forest of TreeNodes from a flat users list using `parentId`.
 * Users whose parent isn't in the list become roots (so the page shows
 * everything, never drops orphans) but are flagged via `parentMissing` so
 * the UI can surface the broken link instead of rendering them as if they
 * were intentionally top-level.
 */
export function buildTree(users: User[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  users.forEach((u) =>
    byId.set(u.id, {
      ...u,
      children: [],
      depth: 0,
      descendantCount: 0,
      parentName: null,
      parentMissing: false,
    }),
  );

  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (parent) {
        node.parentName = parent.displayName;
        parent.children.push(node);
        return;
      }
      node.parentMissing = true;
    }
    roots.push(node);
  });

  const computeDepth = (node: TreeNode, d: number): number => {
    node.depth = d;
    let total = node.children.length;
    node.children.forEach((c) => {
      total += computeDepth(c, d + 1);
    });
    node.descendantCount = total - node.children.length + node.children.length;
    // Recount descendantCount properly
    node.descendantCount = node.children.reduce((acc, c) => acc + 1 + c.descendantCount, 0);
    return node.descendantCount;
  };

  // Sort by role hierarchy first (admin > seller), then by name.
  const ROLE_ORDER = ['admin', 'seller'];
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const ra = ROLE_ORDER.indexOf(a.role);
      const rb = ROLE_ORDER.indexOf(b.role);
      if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
      return a.displayName.localeCompare(b.displayName);
    });
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  roots.forEach((r) => computeDepth(r, 0));

  return roots;
}

export function countAll(roots: TreeNode[]): { total: number; levels: number } {
  let total = 0;
  let levels = 0;
  const walk = (n: TreeNode) => {
    total += 1;
    levels = Math.max(levels, n.depth + 1);
    n.children.forEach(walk);
  };
  roots.forEach(walk);
  return { total, levels };
}

export function flattenIds(roots: TreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (n: TreeNode) => {
    ids.push(n.id);
    n.children.forEach(walk);
  };
  roots.forEach(walk);
  return ids;
}
