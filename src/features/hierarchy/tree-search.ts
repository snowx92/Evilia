/** Digits-only form of a phone string for loose matching. */
export function normalizePhoneDigits(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(/[^\d]/g, '');
}

export type TreeSearchFields = {
  id?: string;
  displayName?: string;
  email?: string;
  phone?: string | null;
  sellerCode?: string | null;
};

/**
 * Match a hierarchy node by display name, seller code (username), email,
 * id, or phone (digit-insensitive).
 */
export function matchesTreeSearch(fields: TreeSearchFields, rawTerm: string): boolean {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return false;

  if (fields.displayName?.toLowerCase().includes(term)) return true;
  if (fields.email?.toLowerCase().includes(term)) return true;
  if (fields.sellerCode?.toLowerCase().includes(term)) return true;
  if (fields.id?.toLowerCase().includes(term)) return true;

  // Require a few digits so short numeric noise doesn't light up every phone.
  const phoneTerm = normalizePhoneDigits(term);
  if (phoneTerm.length >= 3) {
    const phone = normalizePhoneDigits(fields.phone);
    if (phone.includes(phoneTerm)) return true;
  }

  return false;
}

type WalkNode = TreeSearchFields & { id: string; children: WalkNode[] };

/**
 * Walk a forest and collect match ids plus every ancestor that must be
 * expanded so those matches are visible.
 */
export function locateInTree<T extends WalkNode>(
  roots: T[],
  rawTerm: string,
): { matchIds: string[]; expandIds: Set<string> } {
  const matchIds: string[] = [];
  const expandIds = new Set<string>();
  const term = rawTerm.trim();
  if (!term) return { matchIds, expandIds };

  const walk = (node: T, ancestors: string[]): void => {
    if (matchesTreeSearch(node, term)) {
      matchIds.push(node.id);
      ancestors.forEach((id) => expandIds.add(id));
    }
    const nextAncestors = [...ancestors, node.id];
    node.children.forEach((child) => walk(child as T, nextAncestors));
  };

  roots.forEach((r) => walk(r, []));
  return { matchIds, expandIds };
}
