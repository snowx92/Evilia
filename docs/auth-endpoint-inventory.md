# Evilla Auth API — Endpoint Inventory

> Source of truth: `auth.json` (Postman collection v2.1.0).
> Used to drive the Next.js + TypeScript frontend. Do not add endpoints here that are not in the collection.

## Collection metadata

| Field | Value |
|---|---|
| Name | Evilla |
| Schema | Postman v2.1.0 |
| Collection-level auth | none (per-request) |
| Base URL variable | `{{baseUrl}}` |

## Variables / placeholders

| Variable | Used in | Source |
|---|---|---|
| `{{baseUrl}}` | every URL | `.env` → `NEXT_PUBLIC_API_BASE_URL` |
| `{{bearerToken}}` | every authenticated request | `customAuthToken` from `POST /v1/auth/login` |
| `{{notificationId}}` | `PATCH /v1/me/notifications/{id}/read` | item id from `GET /v1/me/notifications` |

## Endpoints

| Folder | Name | Method | Path | Path params | Query params | Body | Auth |
|---|---|---|---|---|---|---|---|
| Auth › Login | Login | POST | `/v1/auth/login` | — | — | `email: string`, `password: string` | none |
| Auth › Me | Get Profile | GET | `/v1/me` | — | — | — | Bearer |
| Auth › Me | Register FCM Token | PUT | `/v1/me/fcm-token` | — | — | `token: string` | Bearer |
| Auth › Me | List Notifications | GET | `/v1/me/notifications` | — | `page?: number-as-string`, `limit?: number-as-string` | — | Bearer |
| Auth › Me | Mark Notification Read | PATCH | `/v1/me/notifications/{notificationId}/read` | `notificationId: string` | — | — | Bearer |
| Auth › Me | Mark All Notifications Read | PATCH | `/v1/me/notifications/read-all` | — | — | — | Bearer |

## Response envelope

All responses follow:

```ts
type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};
```

For operations with no payload, `data` is `null`.

## Inferred models (from saved response examples)

### `User`

```ts
type User = {
  id: string;                     // Firebase-style id, NOT numeric
  displayName: string;
  email: string;
  phone: string | null;
  sellerCode: string | null;
  role: string;                   // enum candidate: "admin" | "super_admin" | "seller" | ...
  parentId: string | null;        // MLM hierarchy parent
  commissionPercentage: number;   // 0-100
  status: string;                 // enum candidate: "active" | ...
  language: string;               // "ar" | "en"
  createdAt: string;              // ISO 8601
  isSuperAdmin: boolean;
  permissions: string[] | null;   // explicit grants; null = inherit from role
};
```

### `Wallet`

```ts
type Wallet = {
  userId: string;
  balance: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  available: number;
  updatedAt: string;              // ISO 8601
};
```

### `PermissionCatalogEntry`

```ts
type PermissionCatalogEntry = {
  key: string;                    // e.g. "users.read"
  label: string;
  labelAr: string;
  description: string;
  group: string;                  // for grouping in UI
  granted: boolean;
};
```

### `Notification`

```ts
type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;              // ISO 8601
  isRead: boolean;
};
```

### `PaginatedResponse<T>` (from notifications list)

```ts
type PaginatedResponse<T> = {
  items: T[];
  pageItems: number;
  totalItems: number;
  isLastPage: boolean;
  nextPageNumber: number;
  currentPage: number;
  totalPages: number;
  docsReaded: number;             // notifications-specific extra
};
```

## Auth flow

1. `POST /v1/auth/login` → returns `user` + `customAuthToken` (JWT).
2. Client stores token (Zustand + httpOnly cookie or localStorage — to be confirmed).
3. Every subsequent request: `Authorization: Bearer <customAuthToken>`.
4. On app boot: `GET /v1/me` returns `user`, `wallet`, `permissionCatalog`, `effectivePermissions[]` — drives both the user shell AND the permission-gated nav.

## Implementation notes for the frontend

- `effectivePermissions` is the source of truth for menu/route gating, NOT `role` alone.
- `permissionCatalog[].granted` mirrors `effectivePermissions` but carries i18n labels (`label` + `labelAr`); use the catalog when rendering admin permission UIs (task 8 → Access module).
- `page` and `limit` are sent as strings in the Postman examples but are semantically numeric — coerce in the service layer.
- `notifications.docsReaded` (sic) is a Notifications-specific counter; do not try to generalize it into the shared `PaginatedResponse<T>` for other modules.
- FCM token registration is fire-and-forget; UI should attempt it post-login if FCM is wired, but never block login on it.
- `isSuperAdmin` overrides permission checks — gate the entire app on `effectivePermissions.length > 0 || user.isSuperAdmin`.
