import type { Locale } from '@/types/auth';

/**
 * Default currency per locale.  Keeps `formatCurrency` honest in regions that
 * don't use EGP.  Override by passing an explicit currency code at the call site.
 */
const DEFAULT_CURRENCY: Record<Locale, string> = {
  ar: 'EGP',
  en: 'EGP',
};

export function defaultCurrencyFor(locale: Locale): string {
  return DEFAULT_CURRENCY[locale] ?? 'EGP';
}
