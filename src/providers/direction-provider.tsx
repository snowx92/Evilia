'use client';

import { useEffect, type ReactNode } from 'react';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { useLocaleStore, direction } from '@/store/locale';

export function DirectionProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);
  const dir = direction(locale);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = dir;
  }, [locale, dir]);

  // Feeds direction to every Radix primitive (ScrollArea, Tooltip, Popover, …)
  // so they don't fall back to their LTR default inside an RTL page.
  return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}
