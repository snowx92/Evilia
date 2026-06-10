'use client';
import { Toaster as SonnerToaster, toast } from 'sonner';
import { useLocaleStore } from '@/store/locale';

export function Toaster() {
  const locale = useLocaleStore((s) => s.locale);
  return (
    <SonnerToaster
      richColors
      closeButton
      position={locale === 'ar' ? 'top-left' : 'top-right'}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border bg-card text-card-foreground shadow-md',
        },
      }}
    />
  );
}

export { toast };
