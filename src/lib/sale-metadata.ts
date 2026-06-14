export type SaleCustomer = {
  name?: string;
  phone?: string;
  gov?: string;
  address?: string;
};

export type SaleProduct = {
  id?: string;
  name?: string;
  quantity?: number;
  itemPrice?: number;
  totalPrice?: number;
  previewImage?: string;
  cost?: number;
  link?: string;
};

export type SalePayment = {
  cost?: number;
  currency?: string;
  discount?: number;
  gateway?: string;
  method?: string;
  paymentStatus?: string;
  affiliateCommission?: number;
  productsPrice?: number;
  profit?: number;
  shippingFees?: number;
  taxes?: number;
  totalPrice?: number;
};

export type SaleUtmData = {
  campaign?: string | null;
  content?: string | null;
  ipAddress?: string | null;
  medium?: string | null;
  referrer?: string | null;
  source?: string | null;
  term?: string | null;
  aff?: string | null;
};

export type ParsedSaleMetadata = {
  orderId?: string;
  storeId?: string;
  orderStatus?: string;
  pickupMethod?: string;
  country?: string;
  productsCount?: number;
  trigger?: string;
  customer?: SaleCustomer;
  products: SaleProduct[];
  payment?: SalePayment;
  utmData?: SaleUtmData;
  unmatchedSellerCode?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseCustomer(raw: unknown): SaleCustomer | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  return {
    name: asString(r.name),
    phone: asString(r.phone),
    gov: asString(r.gov),
    address: asString(r.address),
  };
}

function parseProducts(raw: unknown): SaleProduct[] {
  if (!Array.isArray(raw)) return [];
  const products: SaleProduct[] = [];
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    products.push({
      id: asString(r.id),
      name: asString(r.name),
      quantity: asNumber(r.quantity),
      itemPrice: asNumber(r.itemPrice),
      totalPrice: asNumber(r.totalPrice),
      previewImage: asString(r.previewImage),
      cost: asNumber(r.cost),
      link: asString(r.link),
    });
  }
  return products;
}

function parsePayment(raw: unknown): SalePayment | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  return {
    cost: asNumber(r.cost),
    currency: asString(r.currency),
    discount: asNumber(r.discount),
    gateway: asString(r.gateway),
    method: asString(r.method),
    paymentStatus: asString(r.paymentStatus),
    affiliateCommission: asNumber(r.affiliateCommission),
    productsPrice: asNumber(r.productsPrice),
    profit: asNumber(r.profit),
    shippingFees: asNumber(r.shippingFees),
    taxes: asNumber(r.taxes),
    totalPrice: asNumber(r.totalPrice),
  };
}

function parseUtmData(raw: unknown): SaleUtmData | undefined {
  const r = asRecord(raw);
  if (!r) return undefined;
  return {
    campaign: asString(r.campaign) ?? null,
    content: asString(r.content) ?? null,
    ipAddress: asString(r.ipAddress) ?? null,
    medium: asString(r.medium) ?? null,
    referrer: asString(r.referrer) ?? null,
    source: asString(r.source) ?? null,
    term: asString(r.term) ?? null,
    aff: asString(r.aff) ?? null,
  };
}

export function parseSaleMetadata(metadata?: Record<string, unknown>): ParsedSaleMetadata {
  if (!metadata) {
    return { products: [] };
  }
  return {
    orderId: asString(metadata.orderId),
    storeId: asString(metadata.storeId),
    orderStatus: asString(metadata.status),
    pickupMethod: asString(metadata.pickupMethod),
    country: asString(metadata.country),
    productsCount: asNumber(metadata.productsCount),
    trigger: asString(metadata.trigger),
    customer: parseCustomer(metadata.customer),
    products: parseProducts(metadata.products),
    payment: parsePayment(metadata.payment),
    utmData: parseUtmData(metadata.utmData),
    unmatchedSellerCode: asString(metadata.unmatchedSellerCode),
  };
}

export function saleOrderSummary(meta: ParsedSaleMetadata): string {
  const customer = meta.customer?.name;
  const product = meta.products[0]?.name;
  if (customer && product) return `${customer} · ${product}`;
  if (customer) return customer;
  if (product) return product;
  if (meta.orderId) return `#${meta.orderId}`;
  return '';
}

export function saleCommissionTotal(
  commissions: { amount: number }[],
  affiliateCommission?: number,
): number {
  const fromCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
  if (fromCommissions > 0) return fromCommissions;
  return affiliateCommission ?? 0;
}
