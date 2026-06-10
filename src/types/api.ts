// Shape inferred from auth.json + ADMIN.json — see docs/auth-endpoint-inventory.md
// and docs/admin-endpoint-inventory.md.

export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
  /**
   * Notifications endpoint extra; not present on every paginated response in practice.
   * Keep optional so other modules can reuse this type cleanly.
   */
  docsReaded?: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type ApiErrorPayload = {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.errors;
  }
}
