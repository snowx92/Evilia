'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BellRing,
  Banknote,
  Camera,
  Coins,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  TrendingUp,
  Trash2,
  User as UserIcon,
  Wallet as WalletIcon,
} from 'lucide-react';
import { LinksListEditor } from '@/components/shared/links-list-editor';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/shared/metric-card';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import {
  useChangePasswordMutation,
  useRegisterFcmToken,
  useUpdateProfileMutation,
} from '@/hooks/queries/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { requestFcmToken } from '@/lib/fcm';
import { fileToBase64, type FileToBase64Error } from '@/lib/file-to-base64';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ApiError } from '@/types/api';
import type { Locale } from '@/types/auth';

// ─── Profile info form ───────────────────────────────────────────────────────

const profileSchema = z.object({
  displayName: z.string().min(2),
  phone: z.string().min(0).optional(),
  language: z.enum(['ar', 'en']),
  socialMediaLink: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type ProfileValues = z.infer<typeof profileSchema>;

function ProfileInfoCard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const update = useUpdateProfileMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarData, setAvatarData] = useState<string | null>(user?.profileImageUrl ?? null);
  const [affiliateLinks, setAffiliateLinks] = useState<string[]>(user?.affiliateLinks ?? []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      phone: user?.phone ?? '',
      language: (user?.language as Locale) ?? 'ar',
      socialMediaLink: user?.socialMediaLink ?? '',
    },
  });

  const language = watch('language');

  const onPickFile = async (file: File) => {
    try {
      const dataUrl = await fileToBase64(file, { imageOnly: true });
      setAvatarData(dataUrl);
    } catch (err) {
      const e = err as FileToBase64Error;
      if (e.kind === 'too-large') {
        toast.error(t('common.fileTooLarge', { max: '3 MB' }));
      } else if (e.kind === 'not-image') {
        toast.error(t('common.notAnImage'));
      } else {
        toast.error(t('common.error'));
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const avatarChanged = avatarData !== (user?.profileImageUrl ?? null);
      const cleanedLinks = affiliateLinks.map((l) => l.trim()).filter(Boolean);
      const initialLinks = user?.affiliateLinks ?? [];
      const linksChanged =
        cleanedLinks.length !== initialLinks.length ||
        cleanedLinks.some((l, i) => l !== initialLinks[i]);
      const updated = await update.mutateAsync({
        displayName: values.displayName,
        phone: values.phone || undefined,
        language: values.language,
        ...(values.socialMediaLink ? { socialMediaLink: values.socialMediaLink } : {}),
        ...(avatarChanged ? { profileImageUrl: avatarData } : {}),
        ...(linksChanged ? { affiliateLinks: cleanedLinks } : {}),
      });
      if (updated.user.language) setLocale(updated.user.language);
      toast.success(t('common.save'));
      reset({
        displayName: updated.user.displayName,
        phone: updated.user.phone ?? '',
        language: updated.user.language ?? 'ar',
        socialMediaLink: updated.user.socialMediaLink ?? '',
      });
      setAffiliateLinks(updated.user.affiliateLinks ?? cleanedLinks);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  const initials = getInitials(user?.displayName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-primary" />
          {t('profile.personalInfo')}
        </CardTitle>
        <CardDescription>{t('profile.personalInfoDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Avatar uploader */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-primary-soft">
                {avatarData ? <AvatarImage src={avatarData} alt={user?.displayName ?? ''} /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -end-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-card transition-transform hover:scale-105"
                aria-label={t('common.uploadImage')}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {t('common.uploadImage')}
              </Button>
              {avatarData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setAvatarData(null)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('common.removeImage')}
                </Button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('users.fields.displayName')}</Label>
              <Input
                id="displayName"
                {...register('displayName')}
                aria-invalid={Boolean(errors.displayName)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('common.phone')}</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" dir="ltr" className="ps-10" {...register('phone')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.email')}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input dir="ltr" disabled value={user?.email ?? ''} className="ps-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.language')}</Label>
              <Select
                value={language}
                onValueChange={(v) => setValue('language', v as Locale, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="socialMediaLink">{t('users.fields.socialMediaLink')}</Label>
              <Input
                id="socialMediaLink"
                type="url"
                dir="ltr"
                placeholder="https://"
                {...register('socialMediaLink')}
                aria-invalid={Boolean(errors.socialMediaLink)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t('users.fields.affiliateLinks')}</Label>
              <p className="text-[11px] text-muted-foreground">
                {t('users.fields.affiliateLinksDesc')}
              </p>
              <LinksListEditor
                value={affiliateLinks}
                onChange={setAffiliateLinks}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || update.isPending}
            >
              {(isSubmitting || update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Change password ─────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function ChangePasswordCard() {
  const { t } = useTranslation();
  const change = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(t('profile.passwordChanged'));
      reset();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('common.error'));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          {t('profile.security')}
        </CardTitle>
        <CardDescription>{t('profile.securityDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
            <PasswordInput
              id="currentPassword"
              dir="ltr"
              autoComplete="current-password"
              showLabel={t('auth.showPassword')}
              hideLabel={t('auth.hidePassword')}
              {...register('currentPassword')}
              aria-invalid={Boolean(errors.currentPassword)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
              <PasswordInput
                id="newPassword"
                dir="ltr"
                autoComplete="new-password"
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                {...register('newPassword')}
                aria-invalid={Boolean(errors.newPassword)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                dir="ltr"
                autoComplete="new-password"
                showLabel={t('auth.showPassword')}
                hideLabel={t('auth.hidePassword')}
                {...register('confirmPassword')}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword?.message === 'mismatch' && (
                <p className="text-xs text-destructive">{t('profile.passwordMismatch')}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="submit" disabled={isSubmitting || change.isPending}>
              {(isSubmitting || change.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('profile.changePassword')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Push notifications card ─────────────────────────────────────────────────

function NotificationsCard() {
  const { t } = useTranslation();
  const registerFcm = useRegisterFcmToken();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });
  const [enabling, setEnabling] = useState(false);

  const enable = async () => {
    setEnabling(true);
    try {
      const token = await requestFcmToken();
      if (token) {
        registerFcm.mutate(token);
        setPermission('granted');
        toast.success(t('profile.pushEnabled'));
      } else {
        // The fcm helper returns null if denied/unsupported; reflect that.
        if (typeof Notification !== 'undefined') setPermission(Notification.permission);
        toast.error(t('common.error'));
      }
    } finally {
      setEnabling(false);
    }
  };

  const enabled = permission === 'granted';
  const unsupported = permission === 'unsupported';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          {t('profile.notifications')}
        </CardTitle>
        <CardDescription>{t('profile.notificationsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl ${
                enabled
                  ? 'bg-success-soft text-success'
                  : 'bg-warning-soft text-warning-foreground'
              }`}
            >
              <BellRing className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-medium">
                {enabled ? t('profile.pushEnabled') : t('profile.pushDisabled')}
              </p>
              {unsupported && (
                <p className="text-xs text-muted-foreground">{t('common.error')}</p>
              )}
            </div>
          </div>
          {!enabled && !unsupported && (
            <Button onClick={enable} disabled={enabling}>
              {enabling && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('profile.enablePush')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Wallet card ─────────────────────────────────────────────────────────────

function WalletCard() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const wallet = useAuthStore((s) => s.wallet);

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            {t('wallets.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-primary" />
          {t('wallets.title')}
        </CardTitle>
        <CardDescription>
          {t('wallets.lastUpdated')}: {formatDateTime(wallet.updatedAt, locale)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t('wallets.balance')}
            value={formatCurrency(wallet.balance, locale)}
            icon={WalletIcon}
            accent="indigo"
          />
          <MetricCard
            label={t('wallets.available')}
            value={formatCurrency(wallet.available, locale)}
            icon={Coins}
            accent="emerald"
          />
          <MetricCard
            label={t('wallets.pendingWithdrawal')}
            value={formatCurrency(wallet.pendingWithdrawal, locale)}
            icon={Banknote}
            accent="amber"
          />
          <MetricCard
            label={t('wallets.totalEarned')}
            value={formatCurrency(wallet.totalEarned, locale)}
            sublabel={`${t('wallets.totalWithdrawn')}: ${formatCurrency(wallet.totalWithdrawn, locale)}`}
            icon={TrendingUp}
            accent="rose"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export function ProfileView() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t('profile.title')}
        title={user?.displayName ?? '—'}
        description={user?.email ?? ''}
      />

      {/* Identity strip */}
      {user && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 py-5">
            <Avatar className="h-14 w-14 ring-2 ring-border/70">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
              ) : null}
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col leading-tight">
              <p className="text-base font-semibold">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{t(`role.${user.role}`)}</Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'muted'}>
                {t(`status.${user.status}`)}
              </Badge>
              {user.sellerCode && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {user.sellerCode}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {t('profile.memberSince')}: {formatDate(user.createdAt, locale)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <WalletCard />
      <ProfileInfoCard />
      <ChangePasswordCard />
      <NotificationsCard />
    </div>
  );
}
