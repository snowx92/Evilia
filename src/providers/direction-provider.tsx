'use client';

import { useEffect, type ReactNode } from 'react';
import { useLocaleStore, direction } from '@/store/locale';

export function DirectionProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = direction(locale);
  }, [locale]);

  return <>{children}</>;
}
