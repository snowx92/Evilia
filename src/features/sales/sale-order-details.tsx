'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/shared/copy-button';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { ParsedSaleMetadata } from '@/lib/sale-metadata';

function DetailRow({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  copy?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={`text-end ${mono ? 'font-mono text-xs' : ''}`}
        title={value}
      >
        <span className="inline-flex items-center gap-1">
          <span className="max-w-[220px] truncate">{value}</span>
          {copy ? <CopyButton value={copy} /> : null}
        </span>
      </dd>
    </div>
  );
}

export function SaleOrderDetails({ meta, currency }: { meta: ParsedSaleMetadata; currency: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const payment = meta.payment;

  return (
    <div className="space-y-5">
      {/* Customer */}
      {meta.customer && (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.customer')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            <DetailRow label={t('common.name')} value={meta.customer.name} />
            <DetailRow label={t('common.phone')} value={meta.customer.phone} copy={meta.customer.phone} />
            <DetailRow label={t('sales.governorate')} value={meta.customer.gov} />
            <DetailRow label={t('sales.address')} value={meta.customer.address} />
          </dl>
        </section>
      )}

      {/* Products */}
      {meta.products.length > 0 && (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.products')} ({meta.products.length})
          </p>
          <ul className="space-y-2">
            {meta.products.map((product, idx) => (
              <li
                key={`${product.id ?? idx}`}
                className="flex gap-3 rounded-xl border border-border/70 bg-surface p-3"
              >
                {product.previewImage ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                    <Image
                      src={product.previewImage}
                      alt={product.name ?? t('sales.products')}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">{product.name}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {product.quantity != null ? (
                      <span>× {product.quantity}</span>
                    ) : null}
                    {product.itemPrice != null ? (
                      <span>
                        {formatCurrency(product.itemPrice, locale, currency)}
                      </span>
                    ) : null}
                    {product.cost != null ? (
                      <span>
                        {t('sales.cost')}: {formatCurrency(product.cost, locale, currency)}
                      </span>
                    ) : null}
                  </div>
                  {product.link ? (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('sales.viewProduct')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
                {product.totalPrice != null ? (
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(product.totalPrice, locale, currency)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payment */}
      {payment && (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.payment')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            {payment.method ? (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{t('sales.paymentMethod')}</dt>
                <dd>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {payment.method}
                  </Badge>
                </dd>
              </div>
            ) : null}
            <DetailRow label={t('sales.paymentStatus')} value={payment.paymentStatus} />
            <DetailRow
              label={t('sales.productsPrice')}
              value={
                payment.productsPrice != null
                  ? formatCurrency(payment.productsPrice, locale, currency)
                  : undefined
              }
            />
            <DetailRow
              label={t('sales.cost')}
              value={
                payment.cost != null ? formatCurrency(payment.cost, locale, currency) : undefined
              }
            />
            <DetailRow
              label={t('sales.profit')}
              value={
                payment.profit != null ? formatCurrency(payment.profit, locale, currency) : undefined
              }
            />
            <DetailRow
              label={t('sales.affiliateCommission')}
              value={
                payment.affiliateCommission != null
                  ? formatCurrency(payment.affiliateCommission, locale, currency)
                  : undefined
              }
            />
            {payment.shippingFees != null && payment.shippingFees > 0 ? (
              <DetailRow
                label={t('sales.shipping')}
                value={formatCurrency(payment.shippingFees, locale, currency)}
              />
            ) : null}
            {payment.discount != null && payment.discount > 0 ? (
              <DetailRow
                label={t('sales.discount')}
                value={formatCurrency(payment.discount, locale, currency)}
              />
            ) : null}
          </dl>
        </section>
      )}

      {/* Attribution */}
      {meta.utmData && (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.attribution')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            <DetailRow label={t('sales.trafficSource')} value={meta.utmData.source} />
            <DetailRow label={t('sales.referrer')} value={meta.utmData.referrer} />
            <DetailRow label={t('sales.affiliateCode')} value={meta.utmData.aff} />
            <DetailRow label={t('sales.campaign')} value={meta.utmData.campaign} />
            <DetailRow label={t('sales.ipAddress')} value={meta.utmData.ipAddress} mono />
          </dl>
        </section>
      )}
    </div>
  );
}
