import type { User } from '@/types/auth';

export type HierarchyNode = User & {
  children?: HierarchyNode[];
};

export type HierarchyParams = {
  rootId: string;
};

export type ReassignParentRequest = {
  parentId: string;
};
