'use client';
import { useCallback } from 'react';
import { useLocaleStore } from '@/store/locale';
import { translate } from '@/lib/i18n/messages';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback(
    (key: string, values?: Record<string, string | number | boolean>) =>
      translate(locale, key, values),
    [locale],
  );
  return { t, locale };
}
