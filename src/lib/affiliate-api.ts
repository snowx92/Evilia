import { env } from './env';

const AFFILIATE_API_BASE =
  'https://us-central1-brands-61c3d.cloudfunctions.net/app-api/api/';

export type AffiliateCounters = {
  visits: number;
  views: number;
  addedToCart: number;
  orders: number;
  sales: number;
  commissions: number;
};

type ApiEnvelope = {
  status: number;
  message?: string;
  data?: { counters?: Partial<AffiliateCounters> };
};

const EMPTY_COUNTERS: AffiliateCounters = {
  visits: 0,
  views: 0,
  addedToCart: 0,
  orders: 0,
  sales: 0,
  commissions: 0,
};

export async function fetchAffiliateCounters(args: {
  sellerCode: string;
  from?: string;
  to?: string;
  locale?: 'en' | 'ar';
  signal?: AbortSignal;
}): Promise<AffiliateCounters> {
  const code = args.sellerCode.trim().toLowerCase();
  if (!code) return EMPTY_COUNTERS;

  const affiliateLink = `${env.affiliate.linkBase}${code}`;
  const params = new URLSearchParams();
  params.set('affliateLink', affiliateLink);
  params.set('locale', args.locale ?? 'en');
  if (args.from) params.set('from', args.from);
  if (args.to) params.set('to', args.to);
  if (env.affiliate.password) params.set('password', env.affiliate.password);

  const res = await fetch(`${AFFILIATE_API_BASE}affliate?${params.toString()}`, {
    signal: args.signal,
  });
  if (!res.ok) throw new Error(`Affiliate API HTTP ${res.status}`);
  const json = (await res.json()) as ApiEnvelope;
  if (json.status !== 200) throw new Error(json.message ?? 'Affiliate API error');
  const c = json.data?.counters ?? {};
  return {
    visits: c.visits ?? 0,
    views: c.views ?? 0,
    addedToCart: c.addedToCart ?? 0,
    orders: c.orders ?? 0,
    sales: c.sales ?? 0,
    commissions: c.commissions ?? 0,
  };
}
