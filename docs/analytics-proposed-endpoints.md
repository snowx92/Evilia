# Analytics — Proposed Endpoints (Backend Spec)

The current admin API exposes two analytics endpoints:

- `GET /v1/admin/analytics/daily` — today's snapshot
- `GET /v1/admin/analytics/users/{userId}` — single-user monthly aggregate

The redesigned `/admin/analytics` page in the frontend needs a richer surface to power KPIs, time-series charts, sales/withdrawal breakdowns, and a top-performers leaderboard. This document is the contract — implement these and the frontend lights up automatically with no client changes needed.

Until these ship, the frontend renders **deterministic preview data** so the page is fully testable. Any preview-sourced chart shows a small `بيانات معاينة` ("preview data") pill in its header so it's never confused with live data.

---

## Conventions

- All endpoints sit under `/v1/admin/analytics/*`.
- All responses use the standard envelope:
  ```json
  { "status": 200, "message": "OK", "data": <payload> }
  ```
- All money values are **EGP**, returned as plain `number` (no formatting).
- Dates are accepted as ISO `YYYY-MM-DD` and returned the same way (no Firestore timestamps in analytics payloads — these are aggregates, not records).
- All endpoints require the same Bearer token the rest of `/v1/admin/*` uses.
- Range semantics: `from` and `to` are **inclusive**. `to=today` is allowed.
- When `granularity` is `month`, the `bucket` field is `YYYY-MM`. When `day`, it's `YYYY-MM-DD`.
- For "vs previous period" deltas, the previous period is **the immediately preceding window of equal length** (e.g. a 30-day window's prev is the 30 days before `from`).

---

## 1. Overview KPIs

`GET /v1/admin/analytics/overview`

### Query

| name | type | required | notes |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | yes | inclusive |
| `to` | `YYYY-MM-DD` | yes | inclusive |
| `granularity` | `day \| month` | optional | informational only — payload is aggregated either way |

### Response `data`

```ts
{
  totalSales: number;          // EGP, sum across the range
  totalCommissions: number;    // EGP
  newUsers: number;            // count of users created in the range
  paidWithdrawals: number;     // EGP, sum of withdrawals.status='paid' in the range

  // % change vs the previous equal-length period.
  // Convention: ((current - prev) / prev) * 100, rounded to 1 decimal.
  // If prev is 0 and current > 0 → return 100. If both 0 → return 0.
  deltaSales: number;
  deltaCommissions: number;
  deltaNewUsers: number;
  deltaPaidWithdrawals: number;
}
```

### Example

```http
GET /v1/admin/analytics/overview?from=2026-05-12&to=2026-06-10
```

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "totalSales": 1842300,
    "totalCommissions": 138420,
    "newUsers": 312,
    "paidWithdrawals": 412800,
    "deltaSales": 18.4,
    "deltaCommissions": 22.1,
    "deltaNewUsers": -3.2,
    "deltaPaidWithdrawals": 9.6
  }
}
```

---

## 2. Time-series

`GET /v1/admin/analytics/timeseries`

Drives the **Revenue area chart** and the **Activity bar chart**.

### Query

| name | type | required |
|---|---|---|
| `from` | `YYYY-MM-DD` | yes |
| `to` | `YYYY-MM-DD` | yes |
| `granularity` | `day \| month` | yes |

### Response `data`

```ts
{
  granularity: 'day' | 'month';
  points: Array<{
    bucket: string;        // 'YYYY-MM-DD' for day, 'YYYY-MM' for month
    sales: number;         // EGP, total sales in the bucket
    commissions: number;   // EGP
    newUsers: number;      // count
    withdrawals: number;   // EGP (paid)
  }>;
}
```

- `points` MUST be returned in ascending chronological order.
- Empty buckets MUST still be present (with zeros) so the chart x-axis is continuous.

### Example

```http
GET /v1/admin/analytics/timeseries?from=2026-05-12&to=2026-06-10&granularity=day
```

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "granularity": "day",
    "points": [
      { "bucket": "2026-05-12", "sales": 12500, "commissions": 940, "newUsers": 4, "withdrawals": 2200 },
      { "bucket": "2026-05-13", "sales": 14100, "commissions": 1080, "newUsers": 6, "withdrawals": 3100 }
    ]
  }
}
```

---

## 3. Sales status breakdown

`GET /v1/admin/analytics/sales-breakdown`

Drives the **Sales donut**.

### Query

| name | type | required |
|---|---|---|
| `from` | `YYYY-MM-DD` | yes |
| `to` | `YYYY-MM-DD` | yes |

### Response `data`

```ts
{
  byStatus: Array<{
    status: 'pending' | 'processed' | 'cancelled';
    count: number;     // number of sales in this status
    amount: number;    // EGP, summed
  }>;
}
```

- Always return one entry per status, even when count/amount is 0. Order doesn't matter.

### Example

```json
{
  "byStatus": [
    { "status": "processed", "count": 412, "amount": 1320900 },
    { "status": "pending", "count": 38, "amount": 226000 },
    { "status": "cancelled", "count": 9, "amount": 84000 }
  ]
}
```

---

## 4. Top performers

`GET /v1/admin/analytics/top-performers`

Drives the **Top performers** card (Sales tab + Commissions tab).

### Query

| name | type | required | default |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | yes | — |
| `to` | `YYYY-MM-DD` | yes | — |
| `limit` | `number` | optional | `5` |

### Response `data`

```ts
{
  bySales: Array<{
    userId: string;
    displayName: string;
    sellerCode: string | null;
    salesCount: number;
    salesAmount: number;     // EGP
  }>;
  byCommissions: Array<{
    userId: string;
    displayName: string;
    sellerCode: string | null;
    commissionsAmount: number;  // EGP
  }>;
}
```

- Sort `bySales` by `salesAmount` desc; `byCommissions` by `commissionsAmount` desc.
- Return at most `limit` entries in each list.

---

## 5. Withdrawals breakdown

`GET /v1/admin/analytics/withdrawals-breakdown`

Drives the **Withdrawals donut**.

### Query

| name | type | required |
|---|---|---|
| `from` | `YYYY-MM-DD` | yes |
| `to` | `YYYY-MM-DD` | yes |

### Response `data`

```ts
{
  byStatus: Array<{
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    count: number;
    amount: number;   // EGP
  }>;
  totalAmount: number;   // sum across statuses
  totalCount: number;
}
```

- Always include one entry per status (zeros allowed).
- Withdrawals are counted in the period they were **created**, not paid — confirm with product if you'd like to count by paid date instead.

---

## Performance notes

- All five endpoints are read-only aggregations. Cache aggressively — `Cache-Control: private, max-age=60` is fine.
- Recommended index: composite `(createdAt, status)` on Sales, Commissions, Withdrawals. The page hits all five endpoints in parallel on every range change, so latency budget per endpoint is **≤ 300ms p95**.
- If aggregations are expensive over wide ranges, pre-aggregate per day in a separate `analytics_daily` collection and roll up on the fly for monthly buckets.

## Error behavior

- `400` for invalid `from`/`to` formats or `from > to`.
- `403` if the caller lacks an `analytics.read` permission (frontend will hide the nav entry).
- `404` is currently treated by the frontend as "endpoint not implemented yet" — falls back to preview data with the pill. Don't return 404 once the endpoint exists.

## Frontend integration map

| Endpoint | Frontend hook | Component |
|---|---|---|
| `GET /overview` | `useAnalyticsOverview` | `<OverviewKpis>` |
| `GET /timeseries` | `useAnalyticsTimeseries` | `<RevenueChart>`, `<ActivityChart>` |
| `GET /sales-breakdown` | `useAnalyticsSalesBreakdown` | `<SalesStatusChart>` |
| `GET /top-performers` | `useAnalyticsTopPerformers` | `<TopPerformers>` |
| `GET /withdrawals-breakdown` | `useAnalyticsWithdrawals` | `<WithdrawalsChart>` |
| `GET /daily` (existing) | `useDailyAnalyticsQuery` | `<TodaySnapshot>` |
| `GET /users/{userId}` (existing) | `useUserMonthlyAnalyticsQuery` | `<UserMonthlyCard>` |
