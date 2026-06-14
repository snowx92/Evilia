'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Quote,
} from 'lucide-react';
import { BrandMark } from '@/components/layout/brand-mark';
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

const QUOTES = [
  'auth.quoteTeam',
  'auth.quoteGrowth',
  'auth.quoteVision',
] as const;

// ── Tree diagram (SVG) ────────────────────────────────────────────────────
// Pure SVG so it renders identically in RTL/LTR — content is symmetric.
function TreeDiagram() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="h-full w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Connectors — root → 2 children → 4 grandchildren */}
      <g stroke="url(#line-grad)" strokeWidth="1.5" strokeLinecap="round">
        {/* Root to its two children */}
        <path d="M200 40 Q200 65 120 90" />
        <path d="M200 40 Q200 65 280 90" />
        {/* Left child to its two grandchildren */}
        <path d="M120 90 Q120 130 60 175" />
        <path d="M120 90 Q120 130 180 175" />
        {/* Right child to its two grandchildren */}
        <path d="M280 90 Q280 130 220 175" />
        <path d="M280 90 Q280 130 340 175" />
      </g>

      {/* Nodes — glow halo + filled circle + ring */}
      {[
        { cx: 200, cy: 40, r: 16, label: 'A' }, // root
        { cx: 120, cy: 90, r: 13, label: 'B' },
        { cx: 280, cy: 90, r: 13, label: 'C' },
        { cx: 60, cy: 175, r: 10, label: 'D' },
        { cx: 180, cy: 175, r: 10, label: 'E' },
        { cx: 220, cy: 175, r: 10, label: 'F' },
        { cx: 340, cy: 175, r: 10, label: 'G' },
      ].map((n) => (
        <g key={n.label}>
          <circle cx={n.cx} cy={n.cy} r={n.r + 14} fill="url(#node-glow)" />
          <circle
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill="white"
            fillOpacity="0.95"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          <circle cx={n.cx} cy={n.cy} r={n.r * 0.45} fill="#4f46e5" />
        </g>
      ))}
    </svg>
  );
}

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
      const result = await login.mutateAsync(values);
      router.replace(result.user.role === 'seller' ? '/seller' : '/admin');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t('auth.loginFailed');
      toast.error(message);
    }
  });

  const submitting = isSubmitting || login.isPending;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand hero ─────────────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between bg-[radial-gradient(120%_120%_at_0%_0%,#6366f1_0%,#4f46e5_45%,#1e1b4b_100%)]">
        {/* Decorative color blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen">
          <div className="absolute -end-24 -top-24 h-96 w-96 rounded-full bg-fuchsia-500/40 blur-3xl" />
          <div className="absolute -bottom-32 start-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute start-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-300/30 blur-3xl" />
        </div>

        {/* Brand row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-center gap-3"
        >
          <BrandMark size={48} className="bg-white/95 shadow-2xl ring-white/20" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold tracking-tight">
              {t('app.shortName')}
            </span>
            <span className="truncate text-xs text-white/70">{t('app.title')}</span>
          </div>
        </motion.div>

        {/* Centerpiece — logo + welcome + diagram */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 space-y-6"
        >
          <div className="relative mx-auto h-36 w-36">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />
            <Image
              src="/logo.png"
              alt=""
              width={160}
              height={160}
              priority
              className="relative h-full w-full rounded-full object-contain shadow-2xl ring-4 ring-white/20"
            />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t('auth.welcomeBack')}
            </h1>
            <p className="mx-auto max-w-sm text-sm text-white/75">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Network tree diagram */}
          <div className="relative mx-auto h-40 w-full max-w-md">
            <TreeDiagram />
          </div>
        </motion.div>

        {/* Three positive quotes */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
          }}
          className="relative z-10 grid grid-cols-3 gap-3"
        >
          {QUOTES.map((key) => (
            <motion.li
              key={key}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
              className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm"
            >
              <Quote className="h-4 w-4 text-white/70" />
              <p className="text-[12px] leading-snug text-white/90">{t(key)}</p>
            </motion.li>
          ))}
        </motion.ul>
      </aside>

      {/* ── Form panel ───────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden p-6 sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary-soft/40 via-background to-background"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-5">
          <div className="flex items-center gap-2 lg:hidden">
            <BrandMark size={36} />
            <span className="text-sm font-semibold tracking-tight">{t('app.shortName')}</span>
          </div>
          <div className="ms-auto">
            <LocaleSwitcher />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border/70 bg-card/80 p-7 shadow-[0_24px_60px_-24px_hsl(244_60%_40%/0.25)] backdrop-blur-xl sm:p-9">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-medium text-primary">
                <ShieldCheck className="h-3 w-3" />
                {t('auth.loginTitle')}
              </span>
              <h2 className="pt-2 text-2xl font-bold tracking-tight">{t('auth.welcomeBack')}</h2>
              <p className="text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {t('auth.emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder={t('auth.emailPlaceholder')}
                    aria-invalid={Boolean(errors.email)}
                    className="h-11 ps-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {t('auth.passwordLabel')}
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    dir="ltr"
                    placeholder={t('auth.passwordPlaceholder')}
                    aria-invalid={Boolean(errors.password)}
                    className="h-11 ps-10"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="group mt-2 h-12 w-full text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('auth.submitting')}
                  </>
                ) : (
                  <>
                    {t('auth.submit')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-[11px] text-muted-foreground">
              {t('auth.areYouSeller')}{' '}
              <Link href="/seller-login" className="font-medium text-success hover:underline">
                {t('auth.sellerLogin')}
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">{t('app.title')}</p>
        </motion.div>
      </section>
    </div>
  );
}
