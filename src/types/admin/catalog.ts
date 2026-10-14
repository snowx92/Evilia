import type { PaginationParams } from '@/types/api';
import type { TimestampLike } from '@/lib/utils';

export type LocalizedText = {
  en: string;
  ar: string;
};

export type CatalogProductStatus = 'draft' | 'published' | 'archived';
export type CatalogBlockType = 'text' | 'link' | 'video' | 'file' | 'image';

export type CatalogManualBlock = {
  id: string;
  type: CatalogBlockType;
  title: LocalizedText;
  body: LocalizedText;
  url?: string;
  fileUrl?: string;
  fileName?: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: LocalizedText;
  pitch: LocalizedText;
  description: LocalizedText;
  images: string[];
  buyUrl: string;
  status: CatalogProductStatus;
  category: string;
  sortOrder: number;
  /** Optional display override; when empty the API derives it from `price`. */
  priceHint: LocalizedText;
  /** Admin-only CMS note. Sellers see a computed estimate (price × their rate). */
  earnHint: LocalizedText;
  /** Numeric list price; drives the seller earn estimate. */
  price?: number | null;
  currency?: string;
  manualBlocks: CatalogManualBlock[];
  createdBy: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type CatalogProductInput = {
  name: LocalizedText;
  pitch: LocalizedText;
  description: LocalizedText;
  images: string[];
  buyUrl: string;
  status: CatalogProductStatus;
  category: string;
  sortOrder: number;
  priceHint: LocalizedText;
  earnHint: LocalizedText;
  /** null clears the stored price; undefined leaves it unchanged. */
  price?: number | null;
  currency?: string;
  manualBlocks: CatalogManualBlock[];
};

export type CatalogListParams = PaginationParams;
