# Evilia Admin API - Endpoint Inventory

## Summary

- **Total Endpoints**: 33
- **Modules**: 10
- **Base URL Variable**: `{{baseUrl}}`
- **Other Variables**: `{{adminId}}`, `{{expenseId}}`, `{{saleId}}`, `{{targetId}}`, `{{userId}}`, `{{withdrawalId}}`

---

## Targets

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List Targets | `GET` | `/v1/admin/targets` | - | `page`, `limit` |
| Create Target | `POST` | `/v1/admin/targets` | - | - |
| Update Target | `PUT` | `/v1/admin/targets/{{targetId}}` | - | - |

### List Targets

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/targets`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Create Target

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/targets`

**Request Body**:

- type: string
- userId: string
- title: string
- targetAmount: number
- startDate: string
- endDate: string

**Response**: `201 Created`

**Response Shape**:

Object with fields:

- `id`
- `type`
- `userId`
- `title`
- `targetAmount`
- `currentAmount`
- `status`


### Update Target

**Method**: `PUT`

**URL**: `{{baseUrl}}/v1/admin/targets/{{targetId}}`

**Request Body**:

- title: string
- targetAmount: number

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `title`
- `targetAmount`


## Expenses

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List Expense Categories | `GET` | `/v1/admin/expenses/categories` | - | - |
| Create Expense Category | `POST` | `/v1/admin/expenses/categories` | - | - |
| List Expenses | `GET` | `/v1/admin/expenses` | - | `page`, `limit`, `categoryId` |
| Create Expense | `POST` | `/v1/admin/expenses` | - | - |
| Update Expense | `PUT` | `/v1/admin/expenses/{{expenseId}}` | - | - |
| Delete Expense | `DELETE` | `/v1/admin/expenses/{{expenseId}}` | - | - |

### List Expense Categories

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/expenses/categories`

**Response**: `200 OK`

**Response Shape**:

Array of objects with fields:

- `id`
- `name`
- `description`


### Create Expense Category

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/expenses/categories`

**Request Body**:

- name: string
- description: string

**Response**: `201 Created`

**Response Shape**:

Object with fields:

- `id`
- `name`
- `description`


### List Expenses

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/expenses`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |
| `categoryId` | cat_001 | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Create Expense

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/expenses`

**Request Body**:

- title: string
- amount: number
- categoryId: string
- date: string
- notes: string
- attachments: array

**Response**: `201 Created`

**Response Shape**:

Object with fields:

- `id`
- `title`
- `amount`
- `categoryId`


### Update Expense

**Method**: `PUT`

**URL**: `{{baseUrl}}/v1/admin/expenses/{{expenseId}}`

**Request Body**:

- title: string
- amount: number

**Response**: `200 OK`

**Response Shape**:



### Delete Expense

**Method**: `DELETE`

**URL**: `{{baseUrl}}/v1/admin/expenses/{{expenseId}}`

**Response**: `200 OK`

**Response Shape**:



## Analytics

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| Daily Analytics Summary | `GET` | `/v1/admin/analytics/daily` | - | - |
| User Monthly Analytics | `GET` | `/v1/admin/analytics/users/{{userId}}` | - | - |

### Daily Analytics Summary

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/analytics/daily`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `date`
- `totalSales`
- `totalCommissions`
- `activeUsers`


### User Monthly Analytics

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/analytics/users/{{userId}}`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `userId`
- `month`
- `salesTotal`
- `commissionTotal`
- `networkSales`


## Wallets

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| Get User Wallet | `GET` | `/v1/admin/wallets/{{userId}}` | - | - |
| Get User Transactions | `GET` | `/v1/admin/wallets/{{userId}}/transactions` | - | `page`, `limit` |
| Adjust Wallet | `POST` | `/v1/admin/wallets/{{userId}}/adjust` | - | - |

### Get User Wallet

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/wallets/{{userId}}`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `userId`
- `balance`
- `pendingWithdrawal`
- `totalEarned`
- `totalWithdrawn`
- `available`
- `updatedAt`


### Get User Transactions

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/wallets/{{userId}}/transactions`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Adjust Wallet

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/wallets/{{userId}}/adjust`

**Request Body**:

- amount: number
- type: string
- description: string

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `userId`
- `balance`
- `pendingWithdrawal`
- `totalEarned`
- `totalWithdrawn`
- `available`
- `updatedAt`


## Withdrawals

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List All Withdrawals | `GET` | `/v1/admin/withdrawals` | - | `page`, `limit`, `status` |
| Approve Withdrawal | `PATCH` | `/v1/admin/withdrawals/{{withdrawalId}}/approve` | - | - |
| Reject Withdrawal | `PATCH` | `/v1/admin/withdrawals/{{withdrawalId}}/reject` | - | - |
| Mark Withdrawal Paid | `PATCH` | `/v1/admin/withdrawals/{{withdrawalId}}/pay` | - | - |

### List All Withdrawals

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/withdrawals`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |
| `status` | pending | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Approve Withdrawal

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/withdrawals/{{withdrawalId}}/approve`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `status`


### Reject Withdrawal

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/withdrawals/{{withdrawalId}}/reject`

**Request Body**:

- reason: string

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `status`
- `reason`


### Mark Withdrawal Paid

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/withdrawals/{{withdrawalId}}/pay`

**Request Body**:

- paymentReference: string

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `status`
- `paymentReference`


## Commissions

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List All Commissions | `GET` | `/v1/admin/commissions` | - | `page`, `limit` |
| List Commissions By Sale | `GET` | `/v1/admin/commissions/sale/{{saleId}}` | - | - |

### List All Commissions

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/commissions`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### List Commissions By Sale

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/commissions/sale/{{saleId}}`

**Response**: `200 OK`

**Response Shape**:

Array of objects with fields:

- `id`
- `saleId`
- `recipientId`
- `recipientRole`
- `amount`
- `percentage`
- `saleAmount`
- `status`
- `createdAt`


## Sales

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List All Sales | `GET` | `/v1/admin/sales` | - | `page`, `limit`, `status` |

### List All Sales

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/sales`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |
| `status` | processed | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


## Hierarchy

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| Get Hierarchy Tree | `GET` | `/v1/admin/hierarchy` | - | `rootId` |
| Reassign Parent | `PATCH` | `/v1/admin/hierarchy/{{userId}}/parent` | - | - |

### Get Hierarchy Tree

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/hierarchy`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `rootId` | {{userId}} | Yes |

**Response**: `200 OK`

**Response Shape**:

Array of objects with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


### Reassign Parent

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/hierarchy/{{userId}}/parent`

**Request Body**:

- parentId: string

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


## Users

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List Users | `GET` | `/v1/admin/users` | - | `page`, `limit`, `role`, `status` |
| Create User | `POST` | `/v1/admin/users` | - | - |
| Create Sub-Admin | `POST` | `/v1/admin/users` | - | - |
| Get User By ID | `GET` | `/v1/admin/users/{{userId}}` | - | - |
| Update User | `PUT` | `/v1/admin/users/{{userId}}` | - | - |
| Suspend User | `PATCH` | `/v1/admin/users/{{userId}}/suspend` | - | - |
| Activate User | `PATCH` | `/v1/admin/users/{{userId}}/activate` | - | - |

### List Users

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/users`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |
| `role` | seller | Yes |
| `status` | active | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Create User

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/users`

**Response**: `201 Created`

**Response Shape**:

Object with fields:

- `user`
- `customAuthToken`


### Create Sub-Admin

**Method**: `POST`

**URL**: `{{baseUrl}}/v1/admin/users`

**Request Body**:

- displayName: string
- email: string
- password: string
- role: string
- isSuperAdmin: boolean
- permissions: array

**Response**: `201 Created`

**Response Shape**:

Object with fields:

- `user`
- `customAuthToken`


### Get User By ID

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/users/{{userId}}`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


### Update User

**Method**: `PUT`

**URL**: `{{baseUrl}}/v1/admin/users/{{userId}}`

**Request Body**:

- displayName: string
- commissionPercentage: number
- language: string

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


### Suspend User

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/users/{{userId}}/suspend`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


### Activate User

**Method**: `PATCH`

**URL**: `{{baseUrl}}/v1/admin/users/{{userId}}/activate`

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


## Access

| Endpoint | Method | URL | Path Params | Query Params |
|----------|--------|-----|-------------|--------------|
| List Permission Catalog | `GET` | `/v1/admin/permissions` | - | - |
| List Admins | `GET` | `/v1/admin/admins` | - | `page`, `limit` |
| Update Admin Permissions | `PUT` | `/v1/admin/admins/{{adminId}}/permissions` | - | - |

### List Permission Catalog

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/permissions`

**Response**: `200 OK`

**Response Shape**:

Array of objects with fields:

- `key`
- `label`
- `labelAr`
- `description`
- `group`


### List Admins

**Method**: `GET`

**URL**: `{{baseUrl}}/v1/admin/admins`

**Query Parameters**:

| Name | Example | Required |
|------|---------|----------|
| `page` | 1 | Yes |
| `limit` | 20 | Yes |

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `items`
- `pageItems`
- `totalItems`
- `isLastPage`
- `nextPageNumber`
- `currentPage`
- `totalPages`
- `docsReaded`


### Update Admin Permissions

**Method**: `PUT`

**URL**: `{{baseUrl}}/v1/admin/admins/{{adminId}}/permissions`

**Request Body**:

- permissions: array

**Response**: `200 OK`

**Response Shape**:

Object with fields:

- `id`
- `displayName`
- `email`
- `phone`
- `sellerCode`
- `role`
- `parentId`
- `commissionPercentage`
- `status`
- `language`
- `createdAt`
- `isSuperAdmin`
- `permissions`


---

## Data Models

### Access

```typescript
interface Access {
  commissionPercentage: number;
  createdAt: str;
  currentPage: number;
  description: str;
  displayName: str;
  docsReaded: number;
  email: str;
  group: str;
  id: str;
  isLastPage: boolean;
  isSuperAdmin: boolean;
  items: array;
  key: str;
  label: str;
  labelAr: str;
  language: str;
  nextPageNumber: number;
  pageItems: number;
  parentId: NoneType;
  permissions: array;
  phone: str;
  role: str;
  sellerCode: NoneType;
  status: str;
  totalItems: number;
  totalPages: number;
}
```

### Analytics

```typescript
interface Analytics {
  activeUsers: number;
  commissionTotal: number;
  date: str;
  month: str;
  networkSales: number;
  salesTotal: number;
  totalCommissions: number;
  totalSales: number;
  userId: str;
}
```

### Commissions

```typescript
interface Commissions {
  amount: number;
  createdAt: str;
  currentPage: number;
  docsReaded: number;
  id: str;
  isLastPage: boolean;
  items: array;
  nextPageNumber: number;
  pageItems: number;
  percentage: number;
  recipientId: str;
  recipientRole: str;
  saleAmount: number;
  saleId: str;
  status: str;
  totalItems: number;
  totalPages: number;
}
```

### Expenses

```typescript
interface Expenses {
  amount: number;
  categoryId: str;
  currentPage: number;
  description: str;
  docsReaded: number;
  id: str;
  isLastPage: boolean;
  items: array;
  name: str;
  nextPageNumber: number;
  pageItems: number;
  title: str;
  totalItems: number;
  totalPages: number;
}
```

### Hierarchy

```typescript
interface Hierarchy {
  commissionPercentage: number;
  createdAt: str;
  displayName: str;
  email: str;
  id: str;
  isSuperAdmin: boolean;
  language: str;
  parentId: NoneType;
  permissions: array;
  phone: str;
  role: str;
  sellerCode: NoneType;
  status: str;
}
```

### Sales

```typescript
interface Sales {
  currentPage: number;
  docsReaded: number;
  isLastPage: boolean;
  items: array;
  nextPageNumber: number;
  pageItems: number;
  totalItems: number;
  totalPages: number;
}
```

### Targets

```typescript
interface Targets {
  currentAmount: number;
  currentPage: number;
  docsReaded: number;
  id: str;
  isLastPage: boolean;
  items: array;
  nextPageNumber: number;
  pageItems: number;
  status: str;
  targetAmount: number;
  title: str;
  totalItems: number;
  totalPages: number;
  type: str;
  userId: str;
}
```

### Users

```typescript
interface Users {
  commissionPercentage: number;
  createdAt: str;
  currentPage: number;
  customAuthToken: str;
  displayName: str;
  docsReaded: number;
  email: str;
  id: str;
  isLastPage: boolean;
  isSuperAdmin: boolean;
  items: array;
  language: str;
  nextPageNumber: number;
  pageItems: number;
  parentId: NoneType;
  permissions: array;
  phone: str;
  role: str;
  sellerCode: NoneType;
  status: str;
  totalItems: number;
  totalPages: number;
  user: object;
}
```

### Wallets

```typescript
interface Wallets {
  available: number;
  balance: number;
  currentPage: number;
  docsReaded: number;
  isLastPage: boolean;
  items: array;
  nextPageNumber: number;
  pageItems: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalItems: number;
  totalPages: number;
  totalWithdrawn: number;
  updatedAt: str;
  userId: str;
}
```

### Withdrawals

```typescript
interface Withdrawals {
  currentPage: number;
  docsReaded: number;
  id: str;
  isLastPage: boolean;
  items: array;
  nextPageNumber: number;
  pageItems: number;
  paymentReference: str;
  reason: str;
  status: str;
  totalItems: number;
  totalPages: number;
}
```
# Evilia Admin API - Extended Analysis

## Enumerations & Constants

### Access.role

- `admin`

### Access.status

- `active`

### Hierarchy.role

- `admin`

### Hierarchy.status

- `active`

### Targets.status

- `active`

### Targets.type

- `personal`

### Users.role

- `admin`

### Users.status

- `active`
- `suspended`

### Withdrawals.status

- `approved`
- `paid`
- `rejected`

## Pagination Patterns

### Access

- **List Admins**: `page` + `limit`

### Commissions

- **List All Commissions**: `page` + `limit`

### Expenses

- **List Expenses**: `page` + `limit` + `categoryId`

### Sales

- **List All Sales**: `page` + `limit` + `status`

### Targets

- **List Targets**: `page` + `limit`

### Users

- **List Users**: `page` + `limit` + `role` + `status`

### Wallets

- **Get User Transactions**: `page` + `limit`

### Withdrawals

- **List All Withdrawals**: `page` + `limit` + `status`

## Module Relationships

```
Users
  ├─ Sales (via userId)
  ├─ Wallets (via userId)
  ├─ Withdrawals (referenced in Wallets)
  ├─ Commissions (via userId → recipientId)
  ├─ Targets (via userId)
  ├─ Transactions (via userId → Wallets)
  └─ Hierarchy (via parentId → Users)

Sales
  ├─ Commissions (via saleId)
  └─ Users (via userId)

Wallets
  ├─ Withdrawals (via pendingWithdrawal)
  ├─ Transactions (child resource)
  └─ Users (via userId)

Analytics
  ├─ Daily aggregates (salesTotal, commissions)
  └─ User-level monthly metrics

Access (RBAC)
  ├─ Admins (users with roles)
  └─ Permissions (catalog + assignment)
```

## Filter & Query Patterns

| Pattern | Endpoints | Purpose |
|---------|-----------|---------|
| `page` + `limit` | List endpoints in all modules | Cursor-based pagination (20 items/page default) |
| `status` | Withdrawals, Users | Filter by state (active, pending, approved, rejected, suspended) |
| `role` | Users | Filter by role (seller, admin, sub-admin) |
| `categoryId` | Expenses | Filter expenses by category |
| `rootId` | Hierarchy | Get tree for specific root user |

## Standard Response Wrapper

```typescript
interface ApiResponse<T> {
  status: number;        // 200, 201, 400, etc.
  message: string;       // 'Success', 'Error message'
  data: T;               // Payload (object, array, or pagination wrapper)
}

interface PaginatedResponse<T> {
  items: T[];            // Page items
  pageItems: number;     // Count of items in this page
  totalItems: number;    // Total count across all pages
  isLastPage: boolean;   // Whether this is the final page
  nextPageNumber: number;// Next page number (or current if last)
  currentPage: number;   // 1-indexed page number
  totalPages: number;    // Total page count
  docsReaded: number;    // Items read (?)
}
```

## Auth & Headers

- **Auth Type**: Inherited (likely Bearer token in Authorization header)
- **Content-Type**: `application/json` (for POST/PUT/PATCH)
- **Variables**: All endpoints use `{{baseUrl}}` Postman variable

---

## Quick Reference by HTTP Method

### GET Endpoints (Read-Only)

| Module | Endpoint | URL | Query Params |
|--------|----------|-----|--------------|
| Targets | List Targets | `/v1/admin/targets` | page, limit |
| Expenses | List Expense Categories | `/v1/admin/expenses/categories` | - |
| Expenses | List Expenses | `/v1/admin/expenses` | page, limit, categoryId |
| Analytics | Daily Analytics Summary | `/v1/admin/analytics/daily` | - |
| Analytics | User Monthly Analytics | `/v1/admin/analytics/users/{{userId}}` | - |
| Wallets | Get User Wallet | `/v1/admin/wallets/{{userId}}` | - |
| Wallets | Get User Transactions | `/v1/admin/wallets/{{userId}}/transactions` | page, limit |
| Withdrawals | List All Withdrawals | `/v1/admin/withdrawals` | page, limit, status |
| Commissions | List All Commissions | `/v1/admin/commissions` | page, limit |
| Commissions | List Commissions By Sale | `/v1/admin/commissions/sale/{{saleId}}` | - |
| Sales | List All Sales | `/v1/admin/sales` | page, limit, status |
| Hierarchy | Get Hierarchy Tree | `/v1/admin/hierarchy` | rootId |
| Users | List Users | `/v1/admin/users` | page, limit, role, status |
| Users | Get User By ID | `/v1/admin/users/{{userId}}` | - |
| Access | List Permission Catalog | `/v1/admin/permissions` | - |
| Access | List Admins | `/v1/admin/admins` | page, limit |

### POST Endpoints (Create)

| Module | Endpoint | URL | Body Fields |
|--------|----------|-----|-------------|
| Targets | Create Target | `/v1/admin/targets` | type, userId, title, targetAmount, startDate, endDate |
| Expenses | Create Expense Category | `/v1/admin/expenses/categories` | name, description |
| Expenses | Create Expense | `/v1/admin/expenses` | title, amount, categoryId, date, notes, attachments |
| Wallets | Adjust Wallet | `/v1/admin/wallets/{{userId}}/adjust` | amount, type, description |
| Users | Create User | `/v1/admin/users` | (depends on type) |
| Users | Create Sub-Admin | `/v1/admin/users` | displayName, email, password, role, isSuperAdmin, permissions |

### PUT Endpoints (Full Update)

| Module | Endpoint | URL | Body Fields |
|--------|----------|-----|-------------|
| Targets | Update Target | `/v1/admin/targets/{{targetId}}` | title, targetAmount |
| Expenses | Update Expense | `/v1/admin/expenses/{{expenseId}}` | title, amount |
| Users | Update User | `/v1/admin/users/{{userId}}` | displayName, commissionPercentage, language |
| Access | Update Admin Permissions | `/v1/admin/admins/{{adminId}}/permissions` | permissions |

### PATCH Endpoints (Partial Update / State Change)

| Module | Endpoint | URL | Body Fields | Purpose |
|--------|----------|-----|-------------|---------|
| Withdrawals | Approve Withdrawal | `/v1/admin/withdrawals/{{withdrawalId}}/approve` | - | Approve pending withdrawal |
| Withdrawals | Reject Withdrawal | `/v1/admin/withdrawals/{{withdrawalId}}/reject` | reason | Reject with reason |
| Withdrawals | Mark Withdrawal Paid | `/v1/admin/withdrawals/{{withdrawalId}}/pay` | paymentReference | Complete withdrawal |
| Hierarchy | Reassign Parent | `/v1/admin/hierarchy/{{userId}}/parent` | parentId | Update hierarchy structure |
| Users | Suspend User | `/v1/admin/users/{{userId}}/suspend` | - | Disable user access |
| Users | Activate User | `/v1/admin/users/{{userId}}/activate` | - | Re-enable user access |

### DELETE Endpoints (Removal)

| Module | Endpoint | URL |
|--------|----------|-----|
| Expenses | Delete Expense | `/v1/admin/expenses/{{expenseId}}` |

---

## Critical Implementation Notes

### 1. Pagination Implementation
- All list endpoints use **offset-based pagination** with `page` and `limit`
- Default: `limit=20` items per page
- Always check `isLastPage` boolean to determine if more results exist
- Never rely on `nextPageNumber` alone (check response for more data)

### 2. Date Handling
- ISO 8601 format: `2026-06-01T00:00:00.000Z` (UTC)
- String dates accepted in requests: `2026-06-01` or `2026-06-30`
- All timestamps are in UTC

### 3. User Hierarchy & Commission Model
- **Multi-level MLM structure**: Each user has optional `parentId`
- **Commission inheritance**: `commissionPercentage` at User level + per-Sale breakdown in Commissions
- **Role types**: `seller`, `admin`, `sub-admin` (roles with fewer permissions support RBAC)
- **Super Admin flag**: `isSuperAdmin: boolean` grants all permissions

### 4. Wallet & Withdrawal Flow
- Users earn through Sales → Commissions added to Wallet balance
- `pendingWithdrawal` separate from `available` balance
- Withdrawal states: `pending` → `approved` → `paid` (or `rejected` at any point)
- `paymentReference` only set when status = `paid`

### 5. Response Metadata
- All responses wrapped in `{ status, message, data }`
- Pagination metadata:
  - `pageItems`: Items in current page
  - `totalItems`: Grand total across all pages
  - `docsReaded`: Items processed (internal tracking?)
- Use `totalPages` to calculate expected pages

### 6. Status/Enum Values by Module

| Field | Possible Values | Where |
|-------|-----------------|-------|
| User.status | active, suspended | Users module |
| User.role | seller, admin, sub-admin | Users module |
| Target.status | active, achieved, expired | Targets module (read-only) |
| Target.type | personal, network | Targets module |
| Withdrawal.status | pending, approved, rejected, paid | Withdrawals module |
| Commission.status | pending, paid, cancelled | Commissions module |

### 7. Key Relations for Joins

```
User → Wallet (1:1 via userId)
User → Sales (1:N via userId as seller)
Sale → Commission (1:N via saleId)
User (parent) → User (children via parentId) [Hierarchy]
User → Target (1:N via userId)
User → Transaction (1:N via userId through Wallet)
```

### 8. Missing Endpoint for Sales Details
- **No GET `/v1/admin/sales/{saleId}` endpoint visible** — only list with filters
- Sales endpoint structure suggests items array but response examples not shown
- May need to infer Sale object from Commission response (has `saleId`, `saleAmount`)

---

## TypeScript Boilerplate (Next.js Context)

```typescript
// Common types
type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type PaginatedResponse<T> = {
  items: T[];
  pageItems: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLastPage: boolean;
  nextPageNumber: number;
  docsReaded: number;
};

// User & Hierarchy
type User = {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  sellerCode?: string;
  role: 'seller' | 'admin' | 'sub-admin';
  parentId?: string;
  commissionPercentage: number;
  status: 'active' | 'suspended';
  language: string;
  createdAt: string;
  isSuperAdmin: boolean;
  permissions: string[];
};

// Wallet & Transactions
type Wallet = {
  userId: string;
  balance: number;
  available: number;
  pendingWithdrawal: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
};

// Withdrawals
type Withdrawal = {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  amount?: number;
  paymentReference?: string;
  reason?: string;
  createdAt?: string;
};

// Commissions
type Commission = {
  id: string;
  saleId: string;
  recipientId: string;
  recipientRole: string;
  amount: number;
  percentage: number;
  saleAmount: number;
  status: string;
  createdAt: string;
};

// Targets
type Target = {
  id: string;
  type: 'personal' | 'network';
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: 'active' | 'achieved' | 'expired';
  startDate: string;
  endDate: string;
};
```

