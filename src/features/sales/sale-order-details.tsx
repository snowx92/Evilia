'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/shared/copy-button';
import { useTranslation } from '@/hooks/use-translation';
import { useLocaleStore } from '@/store/locale';
import { formatCurrency } from '@/lib/utils';
import type { ParsedSaleMetadata } from '@/lib/sale-metadata';
import type { Locale } from '@/types/auth';

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

function CurrencyRow({
  label,
  amount,
  currency,
  locale,
}: {
  label: string;
  amount?: number;
  currency: string;
  locale: Locale;
}) {
  if (amount == null) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{formatCurrency(amount, locale, currency)}</dd>
    </div>
  );
}

export function SaleOrderDetails({ meta, currency }: { meta: ParsedSaleMetadata; currency: string }) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const payment = meta.payment;
  const hasOrderOverview = Boolean(
    meta.orderId ||
      meta.orderStatus ||
      meta.marketPlaceId ||
      meta.productsCount != null ||
      meta.pickupMethod ||
      meta.country,
  );

  return (
    <div className="space-y-5">
      {hasOrderOverview ? (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.orderOverview')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            <DetailRow label={t('sales.orderId')} value={meta.orderId} mono copy={meta.orderId} />
            <DetailRow label={t('common.status')} value={meta.orderStatus} />
            <DetailRow label={t('sales.marketplace')} value={meta.marketPlaceId} />
            {meta.productsCount != null ? (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{t('sales.productsCount')}</dt>
                <dd className="font-medium tabular-nums">{meta.productsCount}</dd>
              </div>
            ) : null}
            <DetailRow label={t('sales.pickupMethod')} value={meta.pickupMethod} />
            <DetailRow label={t('sales.country')} value={meta.country} />
          </dl>
        </section>
      ) : null}

      {meta.customer &&
      (meta.customer.name ||
        meta.customer.phone ||
        meta.customer.gov ||
        meta.customer.address) ? (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.customer')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            <DetailRow label={t('common.name')} value={meta.customer.name} />
            <DetailRow
              label={t('common.phone')}
              value={meta.customer.phone}
              mono
              copy={meta.customer.phone ?? undefined}
            />
            <DetailRow label={t('sales.governorate')} value={meta.customer.gov} />
            <DetailRow label={t('sales.address')} value={meta.customer.address} />
          </dl>
        </section>
      ) : null}

      {meta.products.length > 0 ? (
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
                    {product.quantity != null ? <span>× {product.quantity}</span> : null}
                    {product.itemPrice != null ? (
                      <span>{formatCurrency(product.itemPrice, locale, currency)}</span>
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
      ) : null}

      {payment ? (
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
            <DetailRow label={t('sales.gateway')} value={payment.gateway} />
            <DetailRow label={t('sales.paymentStatus')} value={payment.paymentStatus} />
            <CurrencyRow
              label={t('sales.productsPrice')}
              amount={payment.productsPrice}
              currency={currency}
              locale={locale}
            />
            <CurrencyRow label={t('sales.cost')} amount={payment.cost} currency={currency} locale={locale} />
            <CurrencyRow label={t('sales.profit')} amount={payment.profit} currency={currency} locale={locale} />
            <CurrencyRow
              label={t('sales.affiliateCommission')}
              amount={payment.affiliateCommission}
              currency={currency}
              locale={locale}
            />
            <CurrencyRow
              label={t('common.amount')}
              amount={payment.totalPrice}
              currency={currency}
              locale={locale}
            />
            <CurrencyRow
              label={t('sales.paidAmount')}
              amount={payment.paidAmount}
              currency={currency}
              locale={locale}
            />
            <CurrencyRow
              label={t('sales.remainingAmount')}
              amount={payment.remainingAmount}
              currency={currency}
              locale={locale}
            />
            {payment.shippingFees != null && payment.shippingFees > 0 ? (
              <CurrencyRow
                label={t('sales.shipping')}
                amount={payment.shippingFees}
                currency={currency}
                locale={locale}
              />
            ) : null}
            {payment.gatewayFees != null && payment.gatewayFees > 0 ? (
              <CurrencyRow
                label={t('sales.gatewayFees')}
                amount={payment.gatewayFees}
                currency={currency}
                locale={locale}
              />
            ) : null}
            {payment.taxes != null && payment.taxes > 0 ? (
              <CurrencyRow label={t('sales.taxes')} amount={payment.taxes} currency={currency} locale={locale} />
            ) : null}
            {payment.discount != null && payment.discount > 0 ? (
              <CurrencyRow
                label={t('sales.discount')}
                amount={payment.discount}
                currency={currency}
                locale={locale}
              />
            ) : null}
            {payment.needPaymentVerification != null ? (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{t('sales.needsVerification')}</dt>
                <dd>{payment.needPaymentVerification ? t('common.yes') : t('common.no')}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {meta.utmData ? (
        <section className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sales.attribution')}
          </p>
          <dl className="space-y-2 rounded-xl border border-border/70 bg-surface p-4">
            <DetailRow label={t('sales.trafficSource')} value={meta.utmData.source} />
            <DetailRow label={t('sales.medium')} value={meta.utmData.medium} />
            <DetailRow label={t('sales.referrer')} value={meta.utmData.referrer} />
            <DetailRow label={t('sales.affiliateCode')} value={meta.utmData.aff} />
            <DetailRow label={t('sales.campaign')} value={meta.utmData.campaign} />
            <DetailRow label={t('sales.content')} value={meta.utmData.content} />
            <DetailRow label={t('sales.term')} value={meta.utmData.term} />
            <DetailRow label={t('sales.ipAddress')} value={meta.utmData.ipAddress} mono />
          </dl>
        </section>
      ) : null}
    </div>
  );
}
