# Proposed Endpoints (Backend Spec)

Frontend pages marked with the amber dot in the sidebar depend on endpoints the backend hasn't shipped yet. The frontend renders **deterministic preview data** in the meantime so the design is fully testable; each preview-sourced surface shows a `بيانات معاينة` ("preview data") pill so it's never confused with live data.

This document lists every new endpoint the frontend would like. When backend implements one, the corresponding page lights up automatically — no client changes needed.

> **Analytics endpoints** have their own dedicated spec at [`docs/analytics-proposed-endpoints.md`](./analytics-proposed-endpoints.md). This file covers everything else.

## Conventions

- All endpoints sit under `/v1/admin/*` and require the same Bearer token as existing admin endpoints.
- All responses use the standard envelope: `{ status, message, data }`.
- All money values are returned as plain `number` in the relevant `currency`.
- Dates returned as ISO `YYYY-MM-DD` or as Firestore Timestamp shapes (the frontend handles both via `lib/utils.toDate`).
- Paginated responses use the existing wrapper: `{ items, pageItems, totalItems, isLastPage, nextPageNumber, currentPage, totalPages, docsReaded? }`.

---

## Wallets — all transactions

`GET /v1/admin/wallets/transactions`

Drives `/admin/wallets` (the cross-user transaction feed). Replaces the prior UX of "type a userId first".

### Query

| name | type | required | notes |
|---|---|---|---|
| `page` | `number` | optional | default `1` |
| `limit` | `number` | optional | default `20` |
| `userId` | `string` | optional | filter to one user |
| `type` | `commission \| bonus \| withdrawal \| adjustment` | optional | filter by transaction type |
| `from` | `YYYY-MM-DD` | optional | inclusive |
| `to` | `YYYY-MM-DD` | optional | inclusive |

### Response `data` (paginated)

Each item has the exact shape returned by `/v1/admin/wallets/{userId}/transactions` today — keep the contract identical so types stay shared:

```ts
{
  id: string;
  userId: string;
  type: 'commission' | 'bonus' | 'withdrawal' | 'adjustment';
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  referenceType?: 'sale' | 'bonus' | 'withdrawal' | 'adjustment';
  description?: string;
  createdAt: Timestamp | string;
  itemIndex?: number;
}
```

### Example

```http
GET /v1/admin/wallets/transactions?page=1&limit=20&type=commission
```

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "Ncup1DlWA5Uy7eOoW11k",
        "userId": "test-seller-002",
        "type": "commission",
        "amount": 400,
        "balanceBefore": 0,
        "balanceAfter": 400,
        "referenceId": "bwalS45jVgqTV0EEjJ7x",
        "referenceType": "sale",
        "description": "Commission from sale E2E-1780882732464-2",
        "createdAt": { "_seconds": 1780882775, "_nanoseconds": 729000000 }
      }
    ],
    "pageItems": 20,
    "totalItems": 124,
    "isLastPage": false,
    "nextPageNumber": 2,
    "currentPage": 1,
    "totalPages": 7
  }
}
```

### Performance notes

- This is the most-hit aggregate read on the wallets surface — expect 1-3 calls per page view.
- Cache for ~30s. Recommended composite index on `(createdAt DESC, type, userId)`.
- Default sort is `createdAt DESC`.

---

## Wallets — overview (optional)

Not strictly required — the page currently computes its KPI strip from the visible page. If you'd like accurate cross-page totals (especially after filtering), expose:

`GET /v1/admin/wallets/overview`

### Query

Same as the transactions list except no `page`/`limit`.

### Response `data`

```ts
{
  inflow: number;         // sum of commission + bonus + non-negative adjustments
  outflow: number;        // sum of withdrawals
  uniqueUsers: number;
  transactionCount: number;
}
```

---

## Hierarchy — flat fetch (clarification, no new endpoint needed)

The `/admin/hierarchy` page **no longer requires the existing `GET /v1/admin/hierarchy?rootId=` endpoint** — it now builds the org tree client-side from `GET /v1/admin/users` using `parentId`.

That existing hierarchy endpoint is still useful for: building a subtree for a specific root (analytics, scoped exports, audits). No changes required.

The `PATCH /v1/admin/hierarchy/{userId}/parent` mutation is still wired and works as before.

### Performance hint

For installations with > 500 users, consider:

- A `?limit=` cap on `/v1/admin/users` that the frontend can paginate, OR
- A dedicated `GET /v1/admin/users/all` that streams or returns a tighter shape (id, displayName, role, parentId, commissionPercentage). The current page fetches `limit=100`; if your org grows, we'll add a paginated-tree affordance.

---

## Sales — single-sale detail (gap, optional)

Currently `/v1/admin/sales` returns the list. There's no `GET /v1/admin/sales/{id}`. The frontend doesn't need it today because every sale already carries its full `commissions[]` breakdown inline — but if support workflows want to deep-link to a single sale, exposing it would be cheap.

`GET /v1/admin/sales/{saleId}` → returns the same shape as a list item.

---

## Error behavior across all proposed endpoints

- **`200`** with empty `items: []` when no data matches (don't 404 for empty results).
- **`400`** for invalid query params (bad date format, invalid `type` value).
- **`403`** if caller lacks the relevant permission. Frontend hides the nav entry when it sees `403` consistently — make sure permission keys match those in `docs/admin-endpoint-inventory.md`.
- **`404` is currently the "endpoint not implemented" signal** — the frontend treats it as "fall back to preview data, show the pill". Once an endpoint exists, never return `404` for it.

## Frontend integration map

| Endpoint | Frontend hook | Page / component |
|---|---|---|
| `GET /v1/admin/wallets/transactions` | `useAllWalletTransactionsQuery` | `/admin/wallets` |
| `GET /v1/admin/wallets/overview` (optional) | TBD | `/admin/wallets` KPI strip |
| Analytics surface | see [analytics-proposed-endpoints.md](./analytics-proposed-endpoints.md) | `/admin/analytics`, `/admin` dashboard |
