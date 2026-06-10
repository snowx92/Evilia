'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { useLoginMutation } from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from '@/components/ui/sonner';
import { ApiError } from '@/types/api';

const buildSchema = (t: (k: string) => string) =>
  z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const login = useLoginMutation();
  const schema = buildSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      router.replace('/admin');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t('auth.loginFailed');
      toast.error(message);
    }
  });

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <LocaleSwitcher />
        </div>
        <div>
          <CardTitle className="text-xl">{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder={t('auth.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              placeholder={t('auth.passwordPlaceholder')}
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || login.isPending}>
            {(isSubmitting || login.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting || login.isPending ? t('auth.submitting') : t('auth.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
