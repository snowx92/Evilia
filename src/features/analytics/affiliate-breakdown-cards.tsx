'use client';

import { useQuery } from '@tanstack/react-query';
import { Eye, MousePointerClick, ShoppingCart, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAffiliateCounters } from '@/lib/affiliate-api';
import { queryKeys } from '@/lib/query-keys';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { cn, formatNumber } from '@/lib/utils';

type Tone = 'indigo' | 'sky' | 'emerald';

const TONE_CLASSES: Record<Tone, { iconBg: string; iconColor: string; title: string }> = {
  indigo: { iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', title: 'text-indigo-600' },
  sky: { iconBg: 'bg-sky-100', iconColor: 'text-sky-600', title: 'text-sky-600' },
  emerald: { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'text-emerald-600' },
};

export function AffiliateBreakdownCards({
  sellerCode,
  from,
  to,
}: {
  sellerCode: string | undefined;
  from: string;
  to: string;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const code = sellerCode?.trim().toLowerCase() ?? '';

  const query = useQuery({
    queryKey: queryKeys.affiliate.counters(code, from, to),
    queryFn: ({ signal }) =>
      fetchAffiliateCounters({ sellerCode: code, from, to, locale, signal }),
    enabled: Boolean(code),
    staleTime: 60_000,
  });

  if (!code) return null;

  const c = query.data;
  const tiles: {
    key: 'visits' | 'views' | 'addedToCart';
    label: string;
    icon: LucideIcon;
    tone: Tone;
    value: number | undefined;
  }[] = [
    {
      key: 'visits',
      label: t('affiliate.visits'),
      icon: MousePointerClick,
      tone: 'indigo',
      value: c?.visits,
    },
    {
      key: 'views',
      label: t('affiliate.views'),
      icon: Eye,
      tone: 'sky',
      value: c?.views,
    },
    {
      key: 'addedToCart',
      label: t('affiliate.addedToCart'),
      icon: ShoppingCart,
      tone: 'emerald',
      value: c?.addedToCart,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <AffiliateTile
          key={tile.key}
          label={tile.label}
          icon={tile.icon}
          tone={tile.tone}
          value={tile.value}
          isLoading={query.isLoading}
          isError={query.isError}
          locale={locale}
        />
      ))}
    </div>
  );
}

function AffiliateTile({
  label,
  icon: Icon,
  tone,
  value,
  isLoading,
  isError,
  locale,
}: {
  label: string;
  icon: LucideIcon;
  tone: Tone;
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
  locale: 'en' | 'ar';
}) {
  const t = TONE_CLASSES[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', t.iconBg)}>
        <Icon className={cn('h-5 w-5', t.iconColor)} />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : isError ? (
          <p className={cn('mt-0.5 text-lg font-semibold', 'text-muted-foreground')}>—</p>
        ) : (
          <p className={cn('mt-0.5 text-xl font-bold tabular-nums', t.title)}>
            {formatNumber(value ?? 0, locale)}
          </p>
        )}
      </div>
    </div>
  );
}
