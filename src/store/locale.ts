import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale } from '@/types/auth';
import { env } from '@/lib/env';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: env.defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'Luna Care-locale',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const direction = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');
