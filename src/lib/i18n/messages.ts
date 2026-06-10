import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import type { Locale } from '@/types/auth';

export type Messages = typeof ar;

export const messages: Record<Locale, Messages> = {
  ar,
  en: en as Messages,
};

type Primitive = string | number | boolean;

function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function translate(
  locale: Locale,
  key: string,
  values?: Record<string, Primitive>,
): string {
  const dict = messages[locale] ?? messages.ar;
  const fallback = messages.ar;
  const value = (get(dict, key) ?? get(fallback, key) ?? key) as string | undefined;
  if (typeof value !== 'string') return key;
  if (!values) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in values ? String(values[name]) : `{${name}}`,
  );
}
