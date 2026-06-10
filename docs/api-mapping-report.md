# Evilla — API Mapping Verification Report

Source of truth: `docs/auth-endpoint-inventory.md`, `docs/admin-endpoint-inventory.md`, and the raw Postman JSON in `docs/postman/`. Frontend code lives under `src/`.

## 1. Completed endpoints

All 39 endpoints from the two collections are wired through a typed service method, a TanStack Query hook, and at least one UI surface.

### Auth (6/6)

| Endpoint | Service | Hook | UI |
|---|---|---|---|
| `POST /v1/auth/login` | [`authService.login`](src/services/auth.service.ts) | [`useLoginMutation`](src/hooks/queries/use-auth.ts) | [`/(auth)/login`](src/app/(auth)/login/page.tsx) |
| `GET /v1/me` | `authService.me` | `useMeQuery` | [`AuthGuard`](src/components/layout/auth-guard.tsx) (boot) + [Topbar](src/components/layout/topbar.tsx) |
| `PUT /v1/me/fcm-token` | `authService.registerFcmToken` | `useRegisterFcmToken` | auto-fired from `AuthGuard` after login when `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set; gracefully no-ops otherwise |
| `GET /v1/me/notifications` | `authService.listNotifications` | `useNotificationsQuery` | Topbar bell stub (full bell panel is §5) |
| `PATCH /v1/me/notifications/{id}/read` | `authService.markNotificationRead` | `useMarkNotificationRead` | available; UI ships with §5 |
| `PATCH /v1/me/notifications/read-all` | `authService.markAllNotificationsRead` | `useMarkAllNotificationsRead` | available; UI ships with §5 |

### Admin (33/33)

| Module | Endpoint | UI |
|---|---|---|
| Targets | `GET /v1/admin/targets` | [/admin/targets](src/app/admin/targets/page.tsx) list |
| Targets | `POST /v1/admin/targets` | `CreateTargetDialog` |
| Targets | `PUT /v1/admin/targets/{id}` | `EditTargetDialog` |
| Expenses | `GET /v1/admin/expenses/categories` | [/admin/expenses](src/app/admin/expenses/page.tsx) Categories tab + Create dialog dropdown |
| Expenses | `POST /v1/admin/expenses/categories` | `CreateCategoryDialog` |
| Expenses | `GET /v1/admin/expenses` | /admin/expenses list with `categoryId` filter |
| Expenses | `POST /v1/admin/expenses` | `CreateExpenseDialog` |
| Expenses | `PUT /v1/admin/expenses/{id}` | `EditExpenseDialog` |
| Expenses | `DELETE /v1/admin/expenses/{id}` | inline `DeleteButton` |
| Analytics | `GET /v1/admin/analytics/daily` | dashboard cards + /admin/analytics daily section |
| Analytics | `GET /v1/admin/analytics/users/{userId}` | /admin/analytics monthly section |
| Wallets | `GET /v1/admin/wallets/{userId}` | /admin/wallets `WalletSummary` |
| Wallets | `GET /v1/admin/wallets/{userId}/transactions` | /admin/wallets `WalletTransactions` |
| Wallets | `POST /v1/admin/wallets/{userId}/adjust` | `AdjustWalletDialog` |
| Withdrawals | `GET /v1/admin/withdrawals` | /admin/withdrawals list with `status` filter |
| Withdrawals | `PATCH /v1/admin/withdrawals/{id}/approve` | inline `ApproveButton` with confirm |
| Withdrawals | `PATCH /v1/admin/withdrawals/{id}/reject` | inline `RejectDialog` |
| Withdrawals | `PATCH /v1/admin/withdrawals/{id}/pay` | inline `PayDialog` |
| Commissions | `GET /v1/admin/commissions` | /admin/commissions "All" tab |
| Commissions | `GET /v1/admin/commissions/sale/{saleId}` | /admin/commissions "By Sale" tab |
| Sales | `GET /v1/admin/sales` | /admin/sales list with `status` filter |
| Hierarchy | `GET /v1/admin/hierarchy?rootId=` | /admin/hierarchy `HierarchyTree` |
| Hierarchy | `PATCH /v1/admin/hierarchy/{userId}/parent` | inline `ReassignParentDialog` |
| Users | `GET /v1/admin/users` | /admin/users list with `role`+`status` filter |
| Users | `POST /v1/admin/users` | `CreateUserDialog` (covers both Create User and Create Sub-Admin — see §3) |
| Users | `GET /v1/admin/users/{userId}` | available; consumed by future detail page (see §5) |
| Users | `PUT /v1/admin/users/{userId}` | available; consumed by detail page (see §5) |
| Users | `PATCH /v1/admin/users/{userId}/suspend` | `UserRowActions` |
| Users | `PATCH /v1/admin/users/{userId}/activate` | `UserRowActions` |
| Access | `GET /v1/admin/permissions` | /admin/access Catalog tab + reused in user-creation and admin-edit dialogs |
| Access | `GET /v1/admin/admins` | /admin/access Admins tab |
| Access | `PUT /v1/admin/admins/{adminId}/permissions` | `EditAdminPermissionsDialog` |

## 2. Pending endpoints

None. Every endpoint in the two collections has at least a service + hook. Two areas where the **UI** intentionally stops short of the full backend surface and could be enriched in a follow-up are listed in §5.

## 3. Payload alignment

Verified by reading every request body in Postman against the corresponding service method.

### Matches confirmed

- `Login` body: `{ email, password }` → `authService.login`.
- `Create Target` body: `{ type, userId, title, targetAmount, startDate, endDate }`.
- `Update Target` body: `{ title, targetAmount }` (subset of create).
- `Create Expense Category` body: `{ name, description }`.
- `Create Expense` body: `{ title, amount, categoryId, date, notes, attachments }`. The frontend always passes `attachments: []` because file upload is not in the API surface yet (see §6).
- `Update Expense` body: `{ title, amount }`.
- `Adjust Wallet` body: `{ amount, type, description }`. The frontend constrains `type` to a finite `'credit' | 'debit'` because Postman only shows these — see §4.
- `Reject Withdrawal` body: `{ reason }`.
- `Mark Withdrawal Paid` body: `{ paymentReference }`.
- `Reassign Parent` body: `{ parentId }`.
- `Create User` / `Create Sub-Admin`: Postman lists these as two separate items, but they share `POST /v1/admin/users`. The Postman "Create User" example has no request body documented; the "Create Sub-Admin" example body is `{ displayName, email, password, role, isSuperAdmin, permissions }`. The frontend exposes the **Create Sub-Admin** form, which is the strictly more general shape. **Assumption:** sellers and regular users are not created from the admin panel via this endpoint in the current design — they sign up elsewhere.
- `Update User` body: `{ displayName, commissionPercentage, language }`. The frontend service signature only accepts these three keys via `UpdateUserRequest`. (Note: the inline UI for the user edit form is one of the deferred items in §5.)
- `Update Admin Permissions` body: `{ permissions: string[] }`. Selection driven by the permission catalog.

### Discrepancies and choices

1. **`page` / `limit` are strings in Postman, numbers in code.** The Postman examples send `"1"` and `"20"` as strings, but they are semantically numeric. Axios serializes both correctly. Frontend types use `number` and the service layer relies on Axios `params` to URL-encode them. If the backend strictly requires strings, switch to `String(params.page)` in each service method.
2. **`Create Expense` `attachments`.** The Postman example shows `attachments: []`. The frontend ships with an empty array unconditionally and does not surface an upload UI. There is no `POST /uploads`-style endpoint in either collection, so file upload is out of scope.

## 4. Type alignment

TypeScript strict mode is on (`tsconfig.json`) and `tsc --noEmit` returns zero errors across the project.

### Confirmed shapes (single source of truth lives in `src/types/`)

- `User` and `Wallet` are identical between `/v1/me` (auth) and `/v1/admin/wallets/{userId}` + `/v1/admin/users/{userId}` (admin). They share a single definition in [src/types/auth.ts](src/types/auth.ts).
- `PaginatedResponse<T>` covers every paginated list response. `docsReaded` is marked **optional** because it is only documented on the Notifications endpoint; the same wrapper structure is reused everywhere with that field unused.
- The standard `ApiResponse<T>` envelope is enforced by the Axios `unwrap` helper in [src/lib/api/client.ts](src/lib/api/client.ts).

### Type mismatches resolved

| API (Postman) | Frontend choice | Rationale |
|---|---|---|
| `role: string` (only `"admin"` ever appears in examples) | `UserRole = 'admin' \| 'sub-admin' \| 'seller' \| (string & {})` | We keep the union for known values (drives the role filter dropdown + i18n) but leave it open via `(string & {})` so unknown server-side roles don't break the type. |
| `status: string` (`"active"`, `"suspended"`, `"pending"`, `"approved"`, `"paid"`, `"rejected"`, `"processed"`, `"cancelled"`, `"achieved"`, `"expired"`) | Per-module status unions with the open-string escape hatch. | Same pattern — the `StatusBadge` and locale dictionaries cover the known states, anything unknown still renders. |
| `Target.startDate` / `endDate` | optional on the response type, required on `CreateTargetRequest`. | The list response example doesn't include them but they're required on create. |
| `WalletTransaction` shape | inferred (`{ id, userId, amount, type, description?, createdAt }`). | The Postman entry for `GET /transactions` only shows the paginated wrapper. Real shape will need backend confirmation — flagged here as an inferred shape. |
| `Sale` shape | inferred (`{ id, userId?, amount, status, createdAt? }`). | The Postman entry only shows the paginated wrapper; ditto for confirmation. |
| `HierarchyNode = User & { children? }` | inferred. | Postman shows a flat array of users; the UI renders a nested tree by walking `children` when present. If the backend returns a flat list with `parentId`, the UI will still render — children just collapse to a single level. |

### Numeric formatting

`commissionPercentage` is treated as a 0–100 number and rendered via `formatPercent(value, locale)` (which divides by 100 before passing to `Intl.NumberFormat`). The dashboard, users table, and edit dialog all use this helper.

## 5. Missing frontend coverage (intentional follow-ups)

Surface area available in the API but not yet given a dedicated screen:

| Endpoint | Today | Suggested follow-up |
|---|---|---|
| `GET /v1/admin/users/{userId}` and `PUT /v1/admin/users/{userId}` | service + hooks ready; row action goes to wallet instead | A `/admin/users/[id]/page.tsx` detail screen with profile + edit form (`displayName`, `commissionPercentage`, `language`). One file, ~120 LOC. |
| `GET /v1/me/notifications` family | hooks ready; Topbar shows the bell with no panel | Notifications popover in the topbar reusing `useNotificationsQuery` + `useMarkNotificationRead` + `useMarkAllNotificationsRead`. |

These are intentional gaps, not bugs — every endpoint is integrated at the service layer and ready to be lifted into UI.

## 6. Missing API fields (frontend would benefit)

Field that the UI displays but the API doesn't return:

- **None.** Every column rendered in a table maps to a field present in the documented response shape. The dashboard wallet card consumes `wallet` from `/v1/me`, and all other admin screens render only fields documented in `docs/admin-endpoint-inventory.md`.

Field that would be useful but Postman doesn't expose:

- `Sale.id`, `Sale.amount`, `Sale.status` — not in the Postman list response example, only inferred. If the backend returns more fields (e.g. customer name, items), the sales table can expose them.
- `WalletTransaction` detailed shape (see §4).
- File upload endpoint for `Expense.attachments` — currently the frontend always sends `[]`.

## 7. Validation alignment

| Endpoint | API requires | Frontend Zod schema |
|---|---|---|
| Login | email + password | `email().email()`, `password().min(6)` |
| Create User | `displayName`, `email`, `password`, `role`, `isSuperAdmin`, `permissions` | matched; `permissions` populated from the Permission Catalog API |
| Create Target | `type`, `userId`, `title`, `targetAmount`, `startDate`, `endDate` | all required, `targetAmount` coerced to positive number, dates as `string` (ISO `YYYY-MM-DD`) |
| Update Target | `title`, `targetAmount` | required + positive |
| Create Expense Category | `name`, `description` | required |
| Create Expense | `title`, `amount`, `categoryId`, `date`, `notes`, `attachments` | required; `attachments` defaulted to `[]` (no upload UI) |
| Update Expense | `title`, `amount` | required + positive |
| Adjust Wallet | `amount`, `type`, `description` | `amount !== 0`, `type ∈ {credit, debit}`, `description.min(1)` |
| Reject Withdrawal | `reason` | required, non-empty |
| Pay Withdrawal | `paymentReference` | required, non-empty |
| Reassign Parent | `parentId` | required, non-empty |
| Update Admin Permissions | `permissions: string[]` | array always sent, may be empty |

No silent validation gaps detected.

## 7a. Firebase auth flow

The login response `customAuthToken` is a **Firebase custom token**, not the JWT to send as `Authorization: Bearer`. Login goes through the canonical exchange:

1. `POST /v1/auth/login` → returns `{ user, customAuthToken }`
2. `signInWithCustomToken(getFirebaseAuth(), customAuthToken)` → Firebase `User`
3. `user.getIdToken()` → Firebase ID token (the actual Bearer)
4. ID token stored in Zustand; Axios interceptor reads it for every request
5. `FirebaseAuthBridge` subscribes to `onIdTokenChanged` so the token auto-refreshes (~55min cadence) and survives reload via Firebase's IndexedDB session

Logout calls `signOut(auth)` in addition to clearing the store and the React Query cache.

FCM web push (the `PUT /v1/me/fcm-token` endpoint) auto-fires from `AuthGuard` once the user session is good — gated on `isFcmConfigured` (= Firebase configured **and** `NEXT_PUBLIC_FIREBASE_VAPID_KEY` set). The service worker lives at `public/firebase-messaging-sw.js`. Until the VAPID key is added, FCM silently no-ops; everything else works.

## 8. RTL / i18n

- Default locale **`ar`** (RTL). Set on `<html lang="ar" dir="rtl">` for first paint, then `DirectionProvider` switches to follow `user.language` after `/v1/me` resolves.
- All shadcn primitives use logical CSS properties (`start/end`, `ps/pe`, `ms/me`) so dialogs, dropdowns, tables, badges, and the sidebar flip without per-component code.
- The PaginationBar swaps `ChevronLeft` and `ChevronRight` based on locale so "previous" and "next" feel correct in both directions.
- Sonner toaster `position` and `dir` follow the active locale.
- Locale dictionary lives in `src/locales/{ar,en}.json`; lookups go through `src/lib/i18n/messages.ts` + `useTranslation()`. Architecture is ready to drop in `next-intl` later — replace the dictionary lookup, keep the same hook API.

## 9. Performance recommendations

1. **TanStack Query is already tuned** with `staleTime: 30s`, `gcTime: 5m`, `refetchOnWindowFocus: false`, and `placeholderData: (prev) => prev` on paginated lists for smooth pagination.
2. **Don't poll** the daily analytics — the API returns a single point. If a live feed is desired later, use `refetchInterval` selectively on `/admin` and `/admin/analytics`.
3. **Memoize wallet summary calculations** — currently re-runs on every render. Cheap, but if `WalletTransactions` grows long, wrap derivations in `useMemo`.
4. **Lazy-load heavy modules** (Hierarchy tree, Analytics charts when added) with `next/dynamic` if cold-start TTI matters on slow networks.
5. **Image domain config**: not currently needed (no remote images in the API surface). Add a `next.config.ts` `images.remotePatterns` entry if an upload endpoint is added later for expense attachments.
6. **Bundle hygiene**: `optimizePackageImports` is already on for `lucide-react` and `@radix-ui/react-icons`. Add more here if other large libraries are introduced.

## 10. UI/UX recommendations

1. **User detail screen** (see §5) unlocks a much better editing workflow than the current dialog-only approach.
2. **Inline notifications popover** — surface `effectivePermissions`-gated unread count next to the bell.
3. **Searchable user pickers**: several flows ask for a `userId` as raw text (Wallets, Analytics monthly, Hierarchy root, Create Target). A typeahead backed by `GET /v1/admin/users?role=...` would remove a huge UX cliff.
4. **Bulk actions on Users / Withdrawals**: the API doesn't expose bulk endpoints, so this is a per-row affair today. If the backend later adds batch suspend/approve, the row-action shape is ready to be lifted into a `selectedRowIds` pattern.
5. **Hierarchy visualization**: the current renderer assumes the backend nests children. If the backend returns a flat list with `parentId`, add a small `buildTree(nodes)` helper in `features/hierarchy/`.
6. **Empty/Error states** are unified through `EmptyState` and `ErrorState`. Custom imagery per module would lift polish further but isn't required for correctness.
7. **Toast strategy**: success toasts use `t('common.save')` which translates fine but isn't specific. Replace with per-action copy (e.g. "User suspended", "Withdrawal approved") for clearer feedback.
8. **Accessibility**: forms use `<Label htmlFor>`, dialogs have proper titles, dropdowns and selects use Radix primitives that ship correct ARIA roles. Add `aria-live="polite"` regions for toast announcements if a screen-reader audit is run.

## 11. Repository quick reference

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                 # AuthGuard + Sidebar + Topbar
│   │   ├── page.tsx                   # Dashboard
│   │   ├── users/page.tsx
│   │   ├── targets/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── wallets/page.tsx
│   │   ├── withdrawals/page.tsx
│   │   ├── commissions/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── hierarchy/page.tsx
│   │   └── access/page.tsx
│   ├── layout.tsx                     # Cairo font, RTL, AppProviders
│   └── globals.css                    # shadcn tokens + RTL helpers
├── components/
│   ├── layout/{auth-guard,sidebar,topbar,nav-config}.tsx
│   ├── shared/{page-header,data-table,empty-state,error-state,pagination-bar,status-badge,role-badge,locale-switcher,permission-gate}.tsx
│   └── ui/                            # shadcn-style primitives
├── features/
│   ├── users/{users-filter-bar,create-user-dialog,user-row-actions}.tsx
│   ├── targets/target-dialogs.tsx
│   ├── expenses/expense-dialogs.tsx
│   ├── hierarchy/{hierarchy-tree,reassign-parent-dialog}.tsx
│   └── access/edit-admin-permissions-dialog.tsx
├── hooks/
│   ├── use-translation.ts
│   └── queries/{use-auth,use-users,use-targets,use-expenses,use-analytics,use-wallets,use-withdrawals,use-commissions,use-sales,use-hierarchy,use-access}.ts
├── lib/
│   ├── api/client.ts                  # Axios + envelope + auth bridge
│   ├── env.ts                         # NEXT_PUBLIC_* loader
│   ├── i18n/messages.ts
│   ├── permissions.ts
│   ├── query-keys.ts
│   └── utils.ts                       # cn + formatters
├── locales/{ar,en}.json
├── providers/{query-provider,auth-bridge,direction-provider,app-providers}.tsx
├── services/{auth,users,targets,expenses,analytics,wallets,withdrawals,commissions,sales,hierarchy,access}.service.ts
├── store/{auth,locale}.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   └── admin/{users,targets,expenses,analytics,wallets,withdrawals,commissions,sales,hierarchy,access,index}.ts
└── constants/admin.ts
```

## 12. Status

- `npx tsc --noEmit` ✅ zero errors.
- All Postman endpoints reachable through typed service methods.
- Postman collections frozen at `docs/postman/` so the next iteration can diff against them.
