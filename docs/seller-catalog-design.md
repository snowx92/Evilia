# Seller catalog (v1)

Internal seller playbook. Lunacaree/Vondera remains checkout.

## Surfaces
- Admin: `/admin/catalog` list, `/admin/catalog/new`, `/admin/catalog/[id]` editor
- Seller: `/catalog` grid, `/catalog/[id]` playbook
- API: `GET/POST /v1/admin/catalog/products`, `GET/PUT/DELETE /v1/admin/catalog/products/:id`
- Seller: `GET /v1/sellers/catalog/products`, `GET /v1/sellers/catalog/products/:id` (published only)

## Product
- Localized `name`, `pitch`, `description` (EN required, AR optional)
- Gallery images, buy URL, status `draft | published | archived`, sort order, optional category
- Display-only `priceHint` and `earnHint` (localized). Not used by the commission engine.
- Manual blocks: `text | link | video | file | image`

## Affiliate copy
`appendAffiliateCode(buyUrl, sellerCode)` → `{url}?aff=code` or `&aff=` if a query already exists. Seller code is lowercased to match existing Luna links.
