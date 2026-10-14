import type { Locale } from '@/types/auth';
import type { LocalizedText } from '@/types/admin/catalog';

export function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' };
}

export function pickLocalized(
  value: Partial<LocalizedText> | null | undefined,
  locale: Locale,
): string {
  if (!value) return '';
  const en = typeof value.en === 'string' ? value.en.trim() : '';
  const ar = typeof value.ar === 'string' ? value.ar.trim() : '';
  return (locale === 'ar' ? ar || en : en || ar) || '';
}
